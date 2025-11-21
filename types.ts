export interface CoverFormData {
  position: string;
  organization: string;
  colorTone: string;
  logoData: string | null; // Base64 URL
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
}