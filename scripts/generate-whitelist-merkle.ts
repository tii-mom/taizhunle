#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Address, Cell, beginCell } from '@ton/core';

type StakeSnapshot = {
  wallet: string;
  stakeAmount: number;
  stakeDays: number;
};

type WhitelistEntry = {
  wallet: string;
  quota: number;
  leaf: Cell;
  proofCell: Cell | null;
};

type TreeNode = {
  cell: Cell;
  indices: number[];
  left?: TreeNode;
  right?: TreeNode;
};

const MAX_CAP_RATIO = 0.5;
const COEFF_AMOUNT = 0.8;
const COEFF_DAYS = 0.01;

function computeQuota(snapshot: StakeSnapshot): number {
  const fromAmount = snapshot.stakeAmount * COEFF_AMOUNT;
  const fromDays = snapshot.stakeDays * COEFF_DAYS;
  const raw = fromAmount + fromDays;
  const cap = snapshot.stakeAmount * MAX_CAP_RATIO;
  return Math.max(0, Math.floor(Math.min(raw, cap)));
}

function buildLeaf(wallet: string, quota: number): Cell {
  const builder = beginCell();
  builder.storeAddress(Address.parse(wallet));
  builder.storeUint(BigInt(quota), 64);
  return builder.endCell();
}

function padLeaves(leaves: TreeNode[]): TreeNode[] {
  if (leaves.length === 0) return leaves;
  const target = 1 << Math.ceil(Math.log2(leaves.length));
  while (leaves.length < target) {
    const clone = leaves[leaves.length - 1];
    leaves.push({ cell: clone.cell, indices: [...clone.indices] });
  }
  return leaves;
}

function buildTree(entries: WhitelistEntry[]): TreeNode | null {
  if (entries.length === 0) return null;
  let level: TreeNode[] = entries.map((entry, index) => ({ cell: entry.leaf, indices: [index] }));
  level = padLeaves(level);

  while (level.length > 1) {
    const next: TreeNode[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1];
      const parentCell = beginCell().storeRef(left.cell).storeRef(right.cell).endCell();
      next.push({ cell: parentCell, indices: [...left.indices, ...right.indices], left, right });
    }
    level = next;
  }

  return level[0];
}

function buildProofCell(path: { direction: number; sibling: Cell }[]): Cell | null {
  if (path.length === 0) {
    return null;
  }

  let next: Cell | null = null;
  for (let i = path.length - 1; i >= 0; i--) {
    const builder = beginCell();
    builder.storeUint(path[i].direction, 1);
    builder.storeRef(path[i].sibling);
    if (next) {
      builder.storeUint(1, 1);
      builder.storeRef(next);
    } else {
      builder.storeUint(0, 1);
    }
    next = builder.endCell();
  }

  return next;
}

function assignProofs(root: TreeNode | null, entries: WhitelistEntry[]): void {
  if (!root) return;

  const traverse = (node: TreeNode, path: { direction: number; sibling: Cell }[]) => {
    if (!node.left || !node.right) {
      node.indices.forEach((index) => {
        const proofCell = buildProofCell(path);
        entries[index].proofCell = proofCell;
      });
      return;
    }

    traverse(node.left, [...path, { direction: 1, sibling: node.right.cell }]);
    traverse(node.right, [...path, { direction: 0, sibling: node.left.cell }]);
  };

  traverse(root, []);
}

function toWhitelistEntry(snapshot: StakeSnapshot): WhitelistEntry | null {
  const quota = computeQuota(snapshot);
  if (quota <= 0) {
    return null;
  }
  return {
    wallet: snapshot.wallet,
    quota,
    leaf: buildLeaf(snapshot.wallet, quota),
    proofCell: null,
  };
}

function writeOutputs(entries: WhitelistEntry[], root: TreeNode | null, quotaOutput: string, metaOutput: string) {
  const payload = entries.map((entry) => ({
    wallet: entry.wallet,
    quota: entry.quota,
    proof: entry.proofCell ? entry.proofCell.toBoc().toString('base64') : null,
  }));
  fs.writeFileSync(quotaOutput, JSON.stringify(payload, null, 2));

  fs.writeFileSync(metaOutput, JSON.stringify({
    root: root ? root.cell.toBoc().toString('base64') : null,
    total: entries.length,
  }, null, 2));
}

function main() {
  const inputPath = process.argv[2] ?? path.resolve('stake_snapshot.json');
  const quotaOutput = process.argv[3] ?? path.resolve('whitelist_quota.json');
  const metaOutput = process.argv[4] ?? path.resolve('whitelist_meta.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Snapshot not found: ${inputPath}`);
    process.exit(1);
  }

  const snapshots = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as StakeSnapshot[];
  const entries = snapshots.map(toWhitelistEntry).filter(Boolean) as WhitelistEntry[];
  const root = buildTree(entries);
  assignProofs(root, entries);
  writeOutputs(entries, root, quotaOutput, metaOutput);

  console.log(`✅ Generated ${entries.length} whitelist entries`);
  console.log(`🔗 Merkle root BOC saved to ${metaOutput}`);
}

main();
