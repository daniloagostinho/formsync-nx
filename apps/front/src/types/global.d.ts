// Declarações de tipo para bibliotecas externas
declare global {
  interface Window {
    // Google Analytics
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    
    // Facebook Pixel
    fbq: (...args: any[]) => void;
    
    // Hotjar
    hj: (...args: any[]) => void;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
    _hj: any;
    
    // LinkedIn Insight Tag
    _linkedin_data_partner_id: string;
    _linkedin_partner_id: string;
  }
}

export {};