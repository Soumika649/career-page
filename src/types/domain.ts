export type Company = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string;
  banner_url: string;
  culture_video_url: string;
  primary_color: string;
  accent_color: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: string;
  company_id: string;
  title: string;
  body: string;
  image_url: string;
  position: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkPolicy = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full time" | "Part time" | "Contract";
export type JobType = "Permanent" | "Temporary" | "Internship";

export type Job = {
  id: string;
  company_id: string;
  title: string;
  job_slug: string;
  department: string;
  location: string;
  work_policy: string;
  employment_type: string;
  experience_level: string;
  job_type: string;
  salary_range: string;
  description: string;
  is_open: boolean;
  posted_at: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Partial<Company> & { owner_id: string; slug: string; name: string };
        Update: Partial<Company>;
      };
      sections: {
        Row: Section;
        Insert: Partial<Section> & { company_id: string; title: string };
        Update: Partial<Section>;
      };
      jobs: {
        Row: Job;
        Insert: Partial<Job> & { company_id: string; title: string; job_slug: string };
        Update: Partial<Job>;
      };
    };
  };
};
