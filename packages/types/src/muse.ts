export interface MuseEvidence {
  label: string;
  reference: string;
  observedAt: string;
}

export interface MuseResponse {
  agent:
    | 'main'
    | 'leads'
    | 'booking'
    | 'courses'
    | 'revenue'
    | 'content'
    | 'fettouma';
  text: string;
  evidence: MuseEvidence[];
  mode: 'local';
}
