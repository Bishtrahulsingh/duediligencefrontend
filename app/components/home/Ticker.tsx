const tickers = [
  { ticker: 'AAPL', name: 'Apple Inc.'},
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'NFLX', name: 'Netflix, Inc.'},
  { ticker: 'SPOT', name: 'Spotify AB'},
  { ticker: 'MSFT', name: 'Microsoft Corp.'},
  { ticker: 'AMZN', name: 'Amazon.com' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.'},
  { ticker: 'META', name: 'Meta Platforms'},
]

function TickerItem({ ticker, name}: (typeof tickers)[0]) {
  return (
    <div className="flex items-center gap-2 px-7 border-r border-dl-border font-mono text-[11px] text-dl-text3 whitespace-nowrap">
      <span className="font-medium text-white ">{ticker}</span>
      <span>{name}</span>
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
