
const API_URL = "https://script.google.com/macros/s/AKfycbyH3uOoS5jSfZFYhMw-dbideyvWf5YPtEiihtTev4EPWi1onE5Ta5ALuMdPMdf9C777/exec";

export interface BookingData {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
}

export interface Slot {
  time: string;
  status: 'livre' | 'ocupado';
}

export const bookingService = {
  async getSlots(date: string): Promise<Slot[]> {
    try {
      const response = await fetch(`${API_URL}?action=slots&date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Erro ao buscar horários");
      return data.slots || [];
    } catch (error) {
      console.error("Erro ao buscar slots:", error);
      return [];
    }
  },

  async createBooking(data: BookingData): Promise<{ success: boolean; protocol?: string; error?: string }> {
    try {
      // Usando GET para evitar problemas de CORS com Google Apps Script Redirection
      const params = new URLSearchParams({
        action: 'book',
        date: data.date,
        time: data.time,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        serviceName: data.serviceName
      });

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const result = await res.json();

      if (!result.success) {
        return { success: false, error: result.message || "Falha ao reservar" };
      }
      return { success: true, protocol: result.protocolo };
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return { success: false, error: "Falha na conexão com o servidor de agendamento." };
    }
  }
};
