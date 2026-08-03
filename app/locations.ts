export type Location = {
  name: string;
  address: string;
  state: string;
  zip: string;
  slug: string;
  status?: "renovation" | "coming-soon";
  plannedFor?: string;
  latitude?: number;
  longitude?: number;
};

const rows = `
Upper West Side|2030 Broadway, New York, NY 10023|NY|10023|upper-west-side
Westfield|210 South Avenue West, Westfield, NJ 07090|NJ|07090|westfield
Chelsea|128 West 23rd Street, New York, NY 10011|NY|10011|chelsea
Hoboken|221 River Street, Hoboken, NJ 07030|NJ|07030|hoboken|renovation
Downtown Brooklyn|310 Schermerhorn Street, Brooklyn, NY 11217|NY|11217|downtown-brooklyn
Springfield|219 Morris Avenue, Springfield, NJ 07081|NJ|07081|springfield
Upper East Side|120 East 86th Street, New York, NY 10028|NY|10028|upper-east-side
Midland Park|80 Godwin Avenue, Midland Park, NJ 07432|NJ|07432|midland-park
Park Slope|493 5th Avenue, Brooklyn, NY 11215|NY|11215|park-slope
Cresskill|1 Union Avenue, Cresskill, NJ 07626|NJ|07626|cresskill
Quakertown|195 North West End Boulevard, Quakertown, PA 18951|PA|18951|quakertown
East Village|10 Stuyvesant Street, New York, NY 10003|NY|10003|east-village
Ledgewood|461 New Jersey 10, Roxbury Township, NJ 07852|NJ|07852|ledgewood
Teterboro|1 Teterboro Landing Drive, Teterboro, NJ 07608|NJ|07608|teterboro
West Harrison|105 Corporate Park Drive, Harrison, NY 10604|NY|10604|west-harrison
Williamsburg|200 Kent Avenue, Brooklyn, NY 11249|NY|11249|williamsburg
Larchmont|1298 West Boston Post Road, Larchmont, NY 10538|NY|10538|larchmont
Bedstuy/Clinton Hill|1031 Fulton Street, Brooklyn, NY 11238|NY|11238|bedstuyclinton-hill
Hudson Square|60 Charlton Street, New York, NY 10013|NY|10013|hudson-square
Astoria|25-25 Broadway, Queens, NY 11106|NY|11106|astoria
Financial District|5 Hanover Street, New York, NY 10005|NY|10005|financial-district
Scarsdale|652 Central Park Avenue, Scarsdale, NY 10583|NY|10583|scarsdale
New Providence|36 South Street, New Providence, NJ 07974|NJ|07974|new-providence
East Providence|125 Newport Avenue, East Providence, RI 02916|RI|02916|east-providence
Midtown East|800 3rd Avenue, New York, NY 10022|NY|10022|midtown-east|renovation
Forest Hills|71-14 Austin Street, Queens, NY 11375|NY|11375|forest-hills
97th & Columbus|741 Columbus Avenue, New York, NY 10025|NY|10025|97th-columbus
Jackson Heights|82-11 37th Ave, Jackson Heights, NY 11372|NY|11372|jackson-heights
Central Harlem|5 West 125th Street, New York, NY 10027|NY|10027|central-harlem
Lenox Hill|888 Lexington Avenue, New York, NY 10065|NY|10065|lenox-hill
Livingston|8119 Town Center Way, Livingston, NJ 07039|NJ|07039|livingston
Lower East Side|126 Delancey Street, New York, NY 10002|NY|10002|lower-east-side
Parsippany|1295 U.S. 46, Parsippany-Troy Hills, NJ 07054|NJ|07054|parsippany
Randolph|148 Center Grove Road, Randolph, NJ 07869|NJ|07869|randolph
Green Brook|245 U.S. 22, Green Brook Township, NJ 08812|NJ|08812|green-brook
Flatbush|2101 Church Avenue, Brooklyn, NY 11226|NY|11226|flatbush
Bay Ridge|7501 5th Avenue, Brooklyn, NY 11209|NY|11209|bay-ridge
West Brighton|800 Forest Avenue, Staten Island, NY 10310|NY|10310|west-brighton
Stamford|1131 High Ridge Road, Stamford, CT 06905|CT|06905|stamford
Fairfield|1885 Black Rock Turnpike, Fairfield, CT 06825|CT|06825|fairfield
Toms River|1 New Jersey 37, Toms River, NJ 08753|NJ|08753|toms-river
Middletown|1405 New Jersey 35, Middletown Township, NJ 07748|NJ|07748|middletown
Pleasantville|70 Memorial Plaza, Pleasantville, NY 10570|NY|10570|pleasantville
Deer Park|1605 Deer Park Avenue, Deer Park, NY 11729|NY|11729|deer-park
Cherry Hill|2050 New Jersey 70, Cherry Hill Township, NJ 08002|NJ|08002|cherry-hill
Ardmore|17 West Lancaster Avenue, Ardmore, PA 19003|PA|19003|ardmore
King of Prussia|600 West Dekalb Pike, King of Prussia, PA 19406|PA|19406|king-of-prussia
Nanuet|44 Rockland Plaza, Nanuet, NY 10954|NY|10954|nanuet
Northeast Philly|2327 Cottman Avenue, Philadelphia, PA 19149|PA|19149|northeast-philly
Newtown Square|3741 West Chester Pike, Newtown Square, PA 19073|PA|19073|newtown-square
Brick|56 Chambers Bridge Road, Brick Township, NJ 08723|NJ|08723|brick
Shrewsbury Plaza|490 Shrewsbury Plaza, Shrewsbury, NJ 07702|NJ|07702|shrewsbury-plaza
Fishtown|23 West Girard Avenue, Philadelphia, PA 19123|PA|19123|fishtown
West Chester|706 East Market Street, West Chester, PA 19382|PA|19382|west-chester
Melville|925 Walt Whitman Road, Melville, NY 11747|NY|11747|melville
Hackensack|100 River Street, Hackensack, NJ 07601|NJ|07601|hackensack
Port Jefferson|4802 Nesconset Highway, Port Jefferson Station, NY 11776|NY|11776|port-jefferson
Woodbridge|10 Green Street, Woodbridge Township, NJ 07095|NJ|07095|woodbridge
Rosslyn|1771 North Pierce Street, Arlington, VA 22209|VA|22209|rosslyn
The Grove Newark|540 Grove Lane, Newark, DE 19711|DE|19711|the-grove-newark
University City|3925 Walnut Street, Philadelphia, PA 19104|PA|19104|university-city
Mount Laurel|127 Ark Road, Mount Laurel Township, NJ 08054|NJ|08054|mount-laurel
South Philly|1001 South Broad Street, Philadelphia, PA 19147|PA|19147|south-philly
Rittenhouse|1600 Chestnut Street, Philadelphia, PA 19103|PA|19103|rittenhouse
Milford|1680 Boston Post Road, Milford, CT 06460|CT|06460|milford
New Dorp|2530 Hylan Boulevard, Staten Island, NY 10306|NY|10306|new-dorp
14th Street NW|1925 14th Street Northwest, Washington, DC 20009|DC|20009|14th-street-nw
Washington Heights|3780 Broadway, New York, NY 10032|NY|10032|washington-heights
Jersey City|350 Grove Street, Jersey City, NJ 07302|NJ|07302|jersey-city
Oceanside|3170 Long Beach Road, Oceanside, NY 11572|NY|11572|oceanside
Coney Island|1223 Surf Avenue, Brooklyn, NY 11224|NY|11224|coney-island
Ridley|233 Morton Avenue, Folsom, PA 19033|PA|19033|ridley
Franconia|7001 Manchester Boulevard, Alexandria, VA 22310|VA|22310|franconia
Jenkintown|1591 The Fairway, Jenkintown, PA 19046|PA|19046|jenkintown
Upper Dublin|1080 Market Street, Dresher, PA 19025|PA|19025|upper-dublin
Westbury|1260 Old Country Road, Westbury, NY 11590|NY|11590|westbury
Darien|306 Post Road, Darien, CT 06820|CT|06820|darien
Yardley|Vansant Drive, Lower Makefield Township, PA 19067|PA|19067|yardley
West End|1200 New Hampshire Avenue Northwest, Washington, DC 20036|DC|20036|west-end
Marlboro Plaza|166 U.S. 9, Englishtown, NJ 07726|NJ|07726|marlboro-plaza
North Brunswick|2415 U.S. Route 1, North Brunswick Township, NJ 08902|NJ|08902|north-brunswick
College Park|7423 Baltimore Avenue, College Park, MD 20740|MD|20740|college-park
Bellmore|2495 Merrick Road, Bellmore, NY 11710|NY|11710|bellmore
East Meadow|2565 Hempstead Turnpike, East Meadow, NY 11554|NY|11554|east-meadow
Holbrook|5801 Sunrise Highway, Holbrook, NY 11741|NY|11741|holbrook
Ridgewood|56-16 Myrtle Avenue, Queens, NY 11385|NY|11385|ridgewood
Canton Crossing|3821 Boston Street, Baltimore, MD 21224|MD|21224|canton-crossing
Reston|11690 Plaza America Drive, Reston, VA 20190|VA|20190|reston
Blue Bell|960 Dekalb Pike, Blue Bell, PA 19422|PA|19422|blue-bell
Wilmington|3206 Avenue North Boulevard, Wilmington, DE 19803|DE|19803|wilmington
Flatlands|2401 Flatbush Avenue, Brooklyn, NY 11234|NY|11234|flatlands
Marlton|500 Route 73 South, Marlton, NJ 08053|NJ|08053|marlton
Natick|219 North Main Street, Natick, MA 01760|MA|01760|natick
Framingham|571 Worcester Road, Framingham, MA 01701|MA|01701|framingham
Plainview|445 South Oyster Bay Road, Plainview, NY 11803|NY|11803|plainview
Cleveland Park|3519 Connecticut Avenue Northwest, Washington, DC 20008|DC|20008|cleveland-park
Media|1127 West Baltimore Pike, Media, PA 19063|PA|19063|media
Fort Lee|2036 Hudson Street, Fort Lee, NJ 07024|NJ|07024|fort-lee
Acton|145 Great Road, Acton, MA 01720|MA|01720|acton
Belmont|493 Trapelo Road, Belmont, MA 02478|MA|02478|belmont
Westport|1300 Post Road East, Westport, CT 06880|CT|06880|westport
Navy Yard|135 N Street Southeast, Washington, DC 20003|DC|20003|navy-yard
Hackettstown|1885 New Jersey 57, Hackettstown, NJ 07840|NJ|07840|hackettstown
Potomac Yard|3615 Richmond Highway, Alexandria, VA 22305|VA|22305|potomac-yard
Newington|3313 Berlin Turnpike, Newington, CT 06111|CT|06111|newington
Huntington|825 New York Avenue, Huntington, NY 11743|NY|11743|huntington
Drexel Hill|5045 Township Line Road, Drexel Hill, PA 19026|PA|19026|drexel-hill
Annapolis|2496 Riva Road, Annapolis, MD 21401|MD|21401|annapolis
Commack|6530 Jericho Turnpike, Commack, NY 11725|NY|11725|commack
Bel Air|131 North Tollgate Road, Bel Air, MD 21014|MD|21014|bel-air
Newton|170 Needham Street, Newton, MA 02464|MA|02464|newton
Medford|49 Station Landing, Medford, MA 02155|MA|02155|medford
Friendship Heights|5300 Wisconsin Avenue, Washington, DC 20015|DC|20015|friendship-heights
Frederick|5473 Urbana Pike, Frederick, MD 21704|MD|21704|frederick
Watertown|541 Arsenal Street, Watertown, MA 02472|MA|02472|watertown
Canton|95 Washington Street, Canton, MA 02021|MA|02021|canton
Burlington|85 Middlesex Turnpike, Burlington, MA 01803|MA|01803|burlington
Cranston|1000 Chapel View Boulevard, Cranston, RI 02920|RI|02920|cranston
New Haven|276 Elm Street, New Haven, CT 06511|CT|06511|new-haven
Peabody|229 Andover Street, Peabody, MA 01960|MA|01960|peabody
Manassas|9508 Liberia Avenue, Manassas, VA 20110|VA|20110|manassas
Parkchester|1498 Metropolitan Avenue, The Bronx, NY 10462|NY|10462|parkchester
Bowie|15443 Excelsior Drive, Bowie, MD 20716|MD|20716|bowie
Wayne|1627 New Jersey 23, Wayne, NJ 07470|NJ|07470|wayne
Fordham|448 East Fordham Road, The Bronx, NY 10458|NY|10458|fordham
Roxborough|701 Cathedral Road, Philadelphia, PA 19128|PA|19128|roxborough
Hybla Valley|7713 Fordson Road, Alexandria, VA 22306|VA|22306|hybla-valley
North Bethesda|12240 Rockville Pike, Rockville, MD 20852|MD|20852|north-bethesda
Ocean Township|2105 New Jersey 35, Ocean Township, NJ 07755|NJ|07755|ocean-township
Leesburg|528 Fort Evans Road Northeast, Leesburg, VA 20176|VA|20176|leesburg
Lawrence|435 Winthrop Avenue, Lawrence, MA 01843|MA|01843|lawrence
Bedford|7 Main Street, Bedford, NH 03110|NH|03110|bedford
Yorktown Heights|370 Underhill Avenue, Yorktown Heights, NY 10598|NY|10598|yorktown-heights
Center Valley|3060 Center Valley Parkway, Center Valley, PA 18034|PA|18034|center-valley
Danbury|132 Federal Road, Danbury, CT 06811|CT|06811|danbury
Lancaster|1200 Christopher Place, Lancaster, PA 17601|PA|17601|lancaster
Trumbull|965 White Plains Road, Trumbull, CT 06611|CT|06611|trumbull
Mechanicsburg|5345 Carlisle Pike, Hampden Township, PA 17050|PA|17050|mechanicsburg
Glen Burnie|891 Cromwell Park Drive, Glen Burnie, MD 21061|MD|21061|glen-burnie
Kendall Square|319 Main Street, Cambridge, MA 02142|MA|02142|kendall-square
Sterling|20980 Southbank Street, Sterling, VA 20165|VA|20165|sterling
Harrisburg|4640 High Pointe Boulevard, Harrisburg, PA 17111|PA|17111|harrisburg
Westwood|201 University Avenue, Westwood, MA 02090|MA|02090|westwood
Woburn|103 Commerce Way, Woburn, MA 01801|MA|01801|woburn
Chelmsford|90 Drum Hill Road, Chelmsford, MA 01824|MA|01824|chelmsford
Port Washington|6 Soundview Market Place, Port Washington, NY 11050|NY|11050|port-washington
Great Neck|48 Great Neck Road, Great Neck Plaza, NY 11021|NY|11021|great-neck`;

export const locations: Location[] = rows.trim().split("\n").map((row) => {
  const [name, address, state, zip, slug, status] = row.split("|");
  return { name, address, state, zip, slug, status: status as Location["status"] };
});

export const comingSoon: Location[] = [
  { name: "Glen Cove", address: "Glen Cove, NY", state: "NY", zip: "", slug: "glen-cove", status: "coming-soon", plannedFor: "February 2027", latitude: 40.8623, longitude: -73.6337 },
  { name: "West Hartford", address: "West Hartford, CT", state: "CT", zip: "", slug: "west-hartford", status: "coming-soon", plannedFor: "August 2026", latitude: 41.7620, longitude: -72.7420 },
  { name: "Falls Church", address: "Falls Church, VA", state: "VA", zip: "", slug: "falls-church", status: "coming-soon", plannedFor: "September 2026", latitude: 38.8823, longitude: -77.1711 },
  { name: "Brookline", address: "Brookline, MA", state: "MA", zip: "", slug: "brookline", status: "coming-soon", plannedFor: "September 2026", latitude: 42.3318, longitude: -71.1212 },
  { name: "Tyngsborough", address: "Tyngsborough, MA", state: "MA", zip: "", slug: "tyngsborough", status: "coming-soon", plannedFor: "August 2026", latitude: 42.6768, longitude: -71.4245 },
  { name: "Fresh Meadows", address: "Fresh Meadows, Queens, NY", state: "NY", zip: "", slug: "fresh-meadows", status: "coming-soon", plannedFor: "October 2026", latitude: 40.7335, longitude: -73.7801 },
  { name: "Bayside", address: "Bayside, Queens, NY", state: "NY", zip: "", slug: "bayside", status: "coming-soon", plannedFor: "November 2026", latitude: 40.7586, longitude: -73.7654 },
  { name: "Emerson", address: "Emerson, NJ", state: "NJ", zip: "", slug: "emerson", status: "coming-soon", plannedFor: "January 2027", latitude: 40.9762, longitude: -74.0263 },
  { name: "Smoketown Station", address: "Woodbridge, VA", state: "VA", zip: "", slug: "smoketown-station", status: "coming-soon", plannedFor: "September 2026", latitude: 38.6440, longitude: -77.3034 },
  { name: "Farmington Valley", address: "Farmington Valley, CT", state: "CT", zip: "", slug: "farmington-valley", status: "coming-soon", plannedFor: "September 2026", latitude: 41.7198, longitude: -72.8320 },
  { name: "Gaithersburg", address: "Gaithersburg, MD", state: "MD", zip: "", slug: "gaithersburg", status: "coming-soon", plannedFor: "August 2026", latitude: 39.1434, longitude: -77.2014 },
  { name: "Lindenhurst", address: "Lindenhurst, NY", state: "NY", zip: "", slug: "lindenhurst", status: "coming-soon", plannedFor: "January 2027", latitude: 40.6868, longitude: -73.3735 },
  { name: "York", address: "York, PA", state: "PA", zip: "", slug: "york", status: "coming-soon", plannedFor: "August 2026", latitude: 39.9626, longitude: -76.7277 },
  { name: "Columbia", address: "Columbia, MD", state: "MD", zip: "", slug: "columbia", status: "coming-soon", plannedFor: "October 2026", latitude: 39.2037, longitude: -76.8610 },
  { name: "Hamden", address: "Hamden, CT", state: "CT", zip: "", slug: "hamden", status: "coming-soon", plannedFor: "August 2026", latitude: 41.3959, longitude: -72.8968 },
  { name: "Indian Orchard", address: "Indian Orchard, Springfield, MA", state: "MA", zip: "", slug: "indian-orchard", status: "coming-soon", plannedFor: "September 2026", latitude: 42.1584, longitude: -72.5051 },
  { name: "Gravesend", address: "Gravesend, Brooklyn, NY", state: "NY", zip: "", slug: "gravesend", status: "coming-soon", plannedFor: "January 2027", latitude: 40.5953, longitude: -73.9708 },
  { name: "Massapequa Park", address: "Massapequa Park, NY", state: "NY", zip: "", slug: "massapequa-park", status: "coming-soon", plannedFor: "August 2026", latitude: 40.6804, longitude: -73.4551 },
  { name: "Salem", address: "Salem, NH", state: "NH", zip: "", slug: "salem", status: "coming-soon", plannedFor: "August 2026", latitude: 42.7884, longitude: -71.2009 },
  { name: "Waldorf", address: "Waldorf, MD", state: "MD", zip: "", slug: "waldorf", status: "coming-soon", plannedFor: "August 2026", latitude: 38.6246, longitude: -76.9391 },
  { name: "Millbury", address: "Millbury, MA", state: "MA", zip: "", slug: "millbury", status: "coming-soon", plannedFor: "September 2026", latitude: 42.1939, longitude: -71.7606 },
];
