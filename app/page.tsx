import zipcodes from "zipcodes";
import MapExplorer from "./MapExplorer";
import { comingSoon, locations } from "./locations";

export default function Home() {
  const openLocations = locations.flatMap((location) => {
    const geo = zipcodes.lookup(location.zip);
    return geo ? [{ ...location, latitude: geo.latitude, longitude: geo.longitude }] : [];
  });
  const geoLocations = [...openLocations, ...comingSoon.map((location) => ({
    ...location,
    latitude: location.latitude as number,
    longitude: location.longitude as number,
  }))];

  const counts = geoLocations.reduce<Record<string, number>>((acc, location) => {
    acc[location.state] = (acc[location.state] || 0) + 1;
    return acc;
  }, {});
  const topMarkets = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Wonder footprint home">wonder<span>•</span></a>
        <div className="header-label">LOCATION INTELLIGENCE</div>
        <a className="source-link" href="https://www.wonder.com/food-delivery-locations" target="_blank" rel="noreferrer">Official directory ↗</a>
      </header>
      <section className="hero">
        <div>
          <span className="kicker">THE WONDER FOOTPRINT · AUGUST 2026</span>
          <h1>One network.<br/><em>{openLocations.length} places</em> to wonder.</h1>
          <p>An interactive view of Wonder’s rapidly growing Northeast food-hall network—plus {comingSoon.length} announced openings—built from the company’s public location directory.</p>
        </div>
        <div className="hero-stats">
          <div><strong>{openLocations.length} + {comingSoon.length}</strong><span>open + announced</span></div>
          <div><strong>{Object.keys(counts).length}</strong><span>states + D.C.</span></div>
          <div><strong>{topMarkets[0][0]} · {topMarkets[0][1]}</strong><span>largest market</span></div>
        </div>
      </section>
      <MapExplorer locations={geoLocations} />
      <section className="market-strip">
        <span>NETWORK CONCENTRATION</span>
        {topMarkets.map(([market, count], i) => <div key={market}><b>0{i + 1}</b><strong>{market}</strong><em>{count} locations</em></div>)}
        <div><b>↗</b><strong>{Object.keys(counts).length - 3} more markets</strong><em>expanding across the Northeast</em></div>
      </section>
      <footer>
        <p><strong>Independent portfolio analysis.</strong> Not affiliated with or endorsed by Wonder Group, Inc. Location names, addresses, renovation notes, and announced opening windows are sourced from Wonder’s public directory and may change. Planned-site markers represent the named market center until a street address is published.</p>
        <p>Prepared by Mallikarjun Aitha · Data current August 3, 2026</p>
      </footer>
    </main>
  );
}
