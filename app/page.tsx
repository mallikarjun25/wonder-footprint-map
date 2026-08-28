import MapExplorer from "./MapExplorer";
import { dataUpdatedAt, locations } from "./locations";

export default function Home() {
  const openLocations = locations.filter((location) => location.status !== "coming-soon");
  const comingSoon = locations.filter((location) => location.status === "coming-soon");
  const geoLocations = locations;

  const counts = geoLocations.reduce<Record<string, number>>((acc, location) => {
    acc[location.state] = (acc[location.state] || 0) + 1;
    return acc;
  }, {});
  const topMarkets = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <main>
      <aside className="project-notice" role="note" aria-label="Independent project notice">
        <strong>Independent test project</strong>
        <span>Made with love by <a href="https://mallikarjun25.github.io/portfolio/" target="_blank" rel="noreferrer">Mallikarjun Aitha</a> using publicly available data from the <a href="https://www.wonder.com/" target="_blank" rel="noreferrer">Wonder</a> location directory. This personal hobby project is not intended for general public use.</span>
      </aside>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="The Wonder Footprint home">The Wonder Footprint</a>
        <nav aria-label="Main navigation">
          <a href="#map">Map</a>
          <a href="#network">Network</a>
          <a href="#about">About</a>
        </nav>
        <a className="source-link" href="https://www.wonder.com/food-delivery-locations" target="_blank" rel="noreferrer">Official directory</a>
      </header>
      <section className="hero">
        <div>
          <span className="kicker">INDEPENDENT LOCATION EXPLORER</span>
          <h1>Wonder locations,<br/>mapped.</h1>
          <p>Explore Wonder’s growing network, discover the closest open food hall, and see where the brand is heading next.</p>
          <a className="hero-cta" href="#map">Explore the map <span>→</span></a>
        </div>
        <div className="hero-stats">
          <div><strong>{openLocations.length}</strong><span>listed locations</span></div>
          <div><strong>{comingSoon.length}</strong><span>coming soon</span></div>
          <div><strong>{Object.keys(counts).length}</strong><span>states and districts</span></div>
        </div>
      </section>
      <div id="map"><MapExplorer locations={geoLocations} /></div>
      <section className="market-strip" id="network">
        <span>THE NETWORK</span>
        {topMarkets.map(([market, count], i) => <div key={market}><b>0{i + 1}</b><strong>{market}</strong><em>{count} locations</em></div>)}
        <div><b>↗</b><strong>{Object.keys(counts).length - 3} more markets</strong><em>and a growing national footprint</em></div>
      </section>
      <footer id="about">
        <p><strong>Independent portfolio project.</strong> Not affiliated with or endorsed by Wonder Group, Inc. Wonder is a trademark of its respective owner. Location information and published hours are sourced from Wonder’s public directory and may change; confirm time-sensitive details on the linked official listing. Most pins are address-geocoded; a small number use ZIP-level placement when an exact public geocode is unavailable.</p>
        <p>Prepared by Mallikarjun Aitha · Last verified against the public directory {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }).format(new Date(dataUpdatedAt))}</p>
      </footer>
    </main>
  );
}
