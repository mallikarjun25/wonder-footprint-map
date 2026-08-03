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
        <a className="wordmark" href="#" aria-label="Wonder footprint home">wonder</a>
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
          <h1>Our locations,<br/>mapped.</h1>
          <p>Explore Wonder’s growing Northeast network, discover the closest open food hall, and see where the brand is heading next.</p>
          <a className="hero-cta" href="#map">Explore the map <span>→</span></a>
        </div>
        <div className="hero-stats">
          <div><strong>{openLocations.length}</strong><span>listed locations</span></div>
          <div><strong>{comingSoon.length}</strong><span>coming soon</span></div>
          <div><strong>{Object.keys(counts).length}</strong><span>markets across the Northeast</span></div>
        </div>
      </section>
      <div id="map"><MapExplorer locations={geoLocations} /></div>
      <section className="market-strip" id="network">
        <span>THE NETWORK</span>
        {topMarkets.map(([market, count], i) => <div key={market}><b>0{i + 1}</b><strong>{market}</strong><em>{count} locations</em></div>)}
        <div><b>↗</b><strong>{Object.keys(counts).length - 3} more markets</strong><em>expanding across the Northeast</em></div>
      </section>
      <footer id="about">
        <p><strong>Independent portfolio analysis.</strong> Not affiliated with or endorsed by Wonder Group, Inc. Location names, addresses, renovation notes, and announced opening windows are sourced from Wonder’s public directory and may change. Planned-site markers represent the named market center until a street address is published.</p>
        <p>Prepared by Mallikarjun Aitha · Data current August 3, 2026</p>
      </footer>
    </main>
  );
}
