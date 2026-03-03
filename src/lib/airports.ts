import type { Airport, Airline } from "@/types";

export const AIRPORTS: Airport[] = [
  { iataCode: "HAN", name: "Noi Bai International Airport", city: "Ha Noi", isInternational: true },
  { iataCode: "SGN", name: "Tan Son Nhat International Airport", city: "Ho Chi Minh", isInternational: true },
  { iataCode: "DAD", name: "Da Nang International Airport", city: "Da Nang", isInternational: true },
  { iataCode: "CXR", name: "Cam Ranh International Airport", city: "Nha Trang", isInternational: true },
  { iataCode: "PQC", name: "Phu Quoc International Airport", city: "Phu Quoc", isInternational: true },
  { iataCode: "HPH", name: "Cat Bi International Airport", city: "Hai Phong", isInternational: true },
  { iataCode: "HUI", name: "Phu Bai International Airport", city: "Hue", isInternational: true },
  { iataCode: "VCA", name: "Can Tho International Airport", city: "Can Tho", isInternational: true },
  { iataCode: "VII", name: "Vinh International Airport", city: "Vinh", isInternational: true },
  { iataCode: "DLI", name: "Lien Khuong International Airport", city: "Da Lat", isInternational: true },
  { iataCode: "VDH", name: "Dong Hoi Airport", city: "Dong Hoi", isInternational: true },
  { iataCode: "VCS", name: "Con Dao Airport", city: "Con Dao", isInternational: false },
  { iataCode: "UIH", name: "Phu Cat Airport", city: "Quy Nhon", isInternational: false },
  { iataCode: "THD", name: "Tho Xuan Airport", city: "Thanh Hoa", isInternational: false },
  { iataCode: "VCL", name: "Chu Lai Airport", city: "Chu Lai", isInternational: false },
  { iataCode: "TBB", name: "Dong Tac Airport", city: "Tuy Hoa", isInternational: false },
  { iataCode: "PXU", name: "Pleiku Airport", city: "Pleiku", isInternational: false },
  { iataCode: "BMV", name: "Buon Ma Thuot Airport", city: "Buon Ma Thuot", isInternational: false },
  { iataCode: "DIN", name: "Dien Bien Phu Airport", city: "Dien Bien Phu", isInternational: false },
  { iataCode: "VKG", name: "Rach Gia Airport", city: "Rach Gia", isInternational: false },
  { iataCode: "CAH", name: "Ca Mau Airport", city: "Ca Mau", isInternational: false },
];

export const AIRLINES: Airline[] = [
  { iataCode: "VN", name: "Vietnam Airlines", type: "full-service", color: "#2563eb", bookingDomain: "www.vietnamairlines.com" },
  { iataCode: "VJ", name: "Vietjet Air", type: "low-cost", color: "#ef4444", bookingDomain: "www.vietjetair.com" },
  { iataCode: "QH", name: "Bamboo Airways", type: "full-service", color: "#10b981", bookingDomain: "www.bambooairways.com" },
  { iataCode: "VU", name: "Vietravel Airlines", type: "low-cost", color: "#f59e0b", bookingDomain: "www.vietravelairlines.com" },
  { iataCode: "BL", name: "Pacific Airlines", type: "low-cost", color: "#8b5cf6", bookingDomain: "www.vietnamairlines.com" },
  { iataCode: "0V", name: "VASCO", type: "regional", color: "#6366f1", bookingDomain: "www.vietnamairlines.com" },
];

export const POPULAR_ROUTES = [
  { origin: "HAN", destination: "SGN", label: "Ha Noi → Ho Chi Minh" },
  { origin: "DAD", destination: "SGN", label: "Da Nang → Ho Chi Minh" },
  { origin: "SGN", destination: "PQC", label: "Ho Chi Minh → Phu Quoc" },
  { origin: "HAN", destination: "DAD", label: "Ha Noi → Da Nang" },
  { origin: "SGN", destination: "CXR", label: "Ho Chi Minh → Nha Trang" },
  { origin: "HAN", destination: "PQC", label: "Ha Noi → Phu Quoc" },
];

export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.iataCode === code);
}

export function getAirline(code: string): Airline | undefined {
  return AIRLINES.find((a) => a.iataCode === code);
}

export function getBookingUrl(
  airline: Airline,
  origin: string,
  destination: string,
  date: string
): string {
  const domain = airline.bookingDomain;

  switch (airline.iataCode) {
    case "VN":
      return `https://${domain}/vi/booking/book-a-trip?from=${origin}&to=${destination}&departDate=${date}&adultCount=1&cabinClass=ECONOMY`;
    case "VJ":
      return `https://${domain}/vi/dat-ve/chon-chuyen-bay?departPort=${origin}&arrivePort=${destination}&departDate=${date}&adultCount=1`;
    case "QH":
      return `https://${domain}/booking?origin=${origin}&destination=${destination}&departureDate=${date}&adults=1`;
    case "VU":
      return `https://${domain}/vi/booking?from=${origin}&to=${destination}&date=${date}`;
    default:
      return `https://${domain}`;
  }
}

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return AIRPORTS;
  return AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
}
