
import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'detailed-wash',
    name: 'Lavagem detalhada',
    price: '',
    description: 'Limpeza minuciosa com pincéis e produtos específicos para cada superfície.',
    icon: 'bubble_chart'
  },
  {
    id: 'technical-polishing',
    name: 'Polimento Técnico',
    price: '',
    description: 'Remoção de riscos e nivelamento do verniz para brilho espelhado.',
    icon: 'auto_fix_high'
  },
  {
    id: 'seat-hygiene',
    name: 'Higienização de bancos',
    price: '',
    description: 'Extração de sujidade profunda em tecidos ou limpeza e hidratação de couro.',
    icon: 'airline_seat_recline_extra'
  },
  {
    id: 'floor-cleaning',
    name: 'Limpeza de Assoalho',
    price: '',
    description: 'Aspiração profunda e limpeza técnica do carpete e tapetes.',
    icon: 'layers'
  },
  {
    id: 'headlight-polishing',
    name: 'Polimento de Faróis',
    price: '',
    description: 'Restauração da transparência e proteção UV para faróis amarelados.',
    icon: 'highlight'
  },
  {
    id: 'technical-waxing',
    name: 'Enceramento Técnico',
    price: '',
    description: 'Aplicação de cera de carnaúba premium para proteção e hidrofobia.',
    icon: 'shield_moon'
  }
];

export const TRUST_BADGES = [
  { icon: 'verified', label: 'Especialistas' },
  { icon: 'schedule', label: 'Serviço Ágil' },
  { icon: 'workspace_premium', label: 'Qualidade Premium' },
  { icon: 'star', label: 'Avaliação 5 Estrelas' }
];
