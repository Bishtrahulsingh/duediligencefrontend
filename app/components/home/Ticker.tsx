const tickers = [
  { ticker: 'AAPL', name: 'Apple Inc.',       stat: '↑ 0.92 confidence', up: true },
  { ticker: 'TSLA', name: 'Tesla, Inc.',      stat: '↓ 3 high risks',    up: false },
  { ticker: 'NFLX', name: 'Netflix, Inc.',    stat: '↑ 0.78 confidence', up: true },
  { ticker: 'SPOT', name: 'Spotify AB',       stat: '↓ 4 open questions',up: false },
  { ticker: 'MSFT', name: 'Microsoft Corp.',  stat: '↑ 0.91 confidence', up: true },
  { ticker: 'AMZN', name: 'Amazon.com',       stat: '↑ 0.87 confidence', up: true },
  { ticker: 'NVDA', name: 'NVIDIA Corp.',     stat: '↑ 0.95 confidence', up: true },
  { ticker: 'META', name: 'Meta Platforms',   stat: '↓ 2 high risks',    up: false },
]

function TickerItem({ ticker, name, stat, up }: (typeof tickers)[0]) {
  return (
    <div className="flex items-center gap-2 px-7 border-r border-dl-border font-mono text-[11px] text-dl-text3 whitespace-nowrap">
      <span className="text-dl-amber font-medium">{ticker}</span>
      <span>{name}</span>
      <span className={up ? 'text-dl-green' : 'text-dl-red'}>{stat}</span>
    </div>
  )
}

export default function Ticker() {
  const doubled = [...tickers, ...tickers]

  return (
    <div className="relative border-t border-b border-dl-border bg-dl-surface py-2.5 overflow-hidden ticker-fade">
      <div className="flex w-max animate-ticker">
        {doubled.map((t, i) => (
          <TickerItem key={i} {...t} />
        ))}
      </div>
    </div>
  )
}
