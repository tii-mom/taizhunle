import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { inviteService } from '../../services/inviteService';

type Props = {
  title: string;
  subtitle: string;
  steps: string[];
};

export function InviteEffect({ title, subtitle, steps }: Props) {
  const [funnel, setFunnel] = useState({ clicks: 0, registrations: 0, bets: 0, earnings: 0 });

  useEffect(() => {
    const fetchFunnel = async () => {
      const data = await inviteService.getInviteFunnel('current_user');
      setFunnel(data);
    };

    fetchFunnel();
    const interval = setInterval(fetchFunnel, 60000);
    return () => clearInterval(interval);
  }, []);

  const funnelData = [
    { label: steps[0] ?? 'Click', value: funnel.clicks, width: '100%', color: 'from-[#10B981] to-[#059669]' },
    { label: steps[1] ?? 'Register', value: funnel.registrations, width: '75%', color: 'from-[#059669] to-[#047857]' },
    { label: steps[2] ?? 'Bet', value: funnel.bets, width: '50%', color: 'from-[#047857] to-[#065f46]' },
    { label: steps[3] ?? 'You earn 1.5%', value: funnel.earnings, width: '25%', color: 'from-[#065f46] to-[#10B981]' },
  ];

  return (
    <section className="space-y-4 rounded-2xl border border-border-light bg-surface-glass/60 p-6 shadow-2xl backdrop-blur-md">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{subtitle}</p>
      </header>

      <div className="space-y-3">
        {funnelData.map((item, index) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{item.label}</span>
                {index < funnelData.length - 1 && <ChevronRight size={16} className="text-text-secondary" />}
              </div>
              <span className="font-mono font-semibold text-[#10B981]">
                {index === funnelData.length - 1 ? `${item.value} TAI` : item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-full overflow-hidden rounded-lg bg-surface-glass/60">
              <div 
                className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out flex items-center justify-center`}
                style={{ width: item.width }}
              >
                <span className="font-mono text-sm font-bold text-white">
                  {index === funnelData.length - 1 ? `${item.value} TAI` : item.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
