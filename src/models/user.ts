export interface UserProfileFormData {
  first_name: string;
  last_name: string;
  middle_name: string;
  suffix: string;
  nick_name: string; 
  contact_number: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  house_no: string;
  sex: "Male" | "Female" | "";
  marital_status: "Single" | "Married" | "Widowed" | "Divorced" | "Seperated" | "";
  citizen_ship: "Filipino" | "Dual Citizen" | "Natural Filipino" | "Foreigner / Foreign National" | "";
  religion: string;
  place_of_birth: string;
  birth_day: string;
  age: string;
  height: string;
  weight: string;
}

export interface UserProfileFormErrors {
  first_name?: string;
  last_name?: string;
  middle_name?: string; 
  contact_number?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  sex?: string;
  marital_status?: string;
  citizen_ship?: string;
  religion?: string;
  place_of_birth?: string;
  birth_day?: string;
  age?: string;
  height?: string;
  weight?: string;
  image?: string;
  recaptcha?: string;
}
