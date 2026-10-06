import type { DailyVisitorTrend } from "@/db/visitors";

export function VisitorTrendChart({ data }: { data: DailyVisitorTrend[] }) {
  const width = 900;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 44, left: 44 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maximum = Math.max(1, ...data.flatMap((row) => [row.page_views, row.visitors]));
  const x = (index: number) => padding.left + (data.length <= 1 ? plotWidth / 2 : index * plotWidth / (data.length - 1));
  const y = (value: number) => padding.top + plotHeight - value / maximum * plotHeight;
  const points = (key: "page_views" | "visitors") => data.map((row, index) => `${x(index)},${y(row[key])}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return <figure className="visitor-trend" aria-labelledby="visitor-trend-title">
    <div className="trend-heading"><div><h2 id="visitor-trend-title">每日訪客趨勢</h2><span>{data[0]?.date} 至 {data.at(-1)?.date}</span></div><div className="trend-legend"><span className="visitors">訪客</span><span className="views">瀏覽</span></div></div>
    <div className="trend-chart-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="每日訪客與瀏覽次數折線圖">
        {[0, .25, .5, .75, 1].map((ratio) => {
          const gridY = padding.top + plotHeight * ratio;
          return <g key={ratio}><line className="trend-grid-line" x1={padding.left} x2={width - padding.right} y1={gridY} y2={gridY} /><text className="trend-axis-label" x={padding.left - 10} y={gridY + 4} textAnchor="end">{Math.round(maximum * (1 - ratio))}</text></g>;
        })}
        <polyline className="trend-line trend-line-views" points={points("page_views")} />
        <polyline className="trend-line trend-line-visitors" points={points("visitors")} />
        {data.map((row, index) => <g key={row.date}>
          <circle className="trend-point trend-point-views" cx={x(index)} cy={y(row.page_views)} r="3"><title>{row.date}：{row.page_views} 次瀏覽</title></circle>
          <circle className="trend-point trend-point-visitors" cx={x(index)} cy={y(row.visitors)} r="3"><title>{row.date}：{row.visitors} 位訪客</title></circle>
          {(index % labelEvery === 0 || index === data.length - 1) && <text className="trend-axis-label" x={x(index)} y={height - 14} textAnchor="middle">{row.date.slice(5)}</text>}
        </g>)}
      </svg>
    </div>
    <details className="trend-data-details"><summary>查看每日數字</summary><div className="trend-data-grid">{data.map((row) => <span key={row.date}><b>{row.date}</b>訪客 {row.visitors}・瀏覽 {row.page_views}</span>)}</div></details>
  </figure>;
}
