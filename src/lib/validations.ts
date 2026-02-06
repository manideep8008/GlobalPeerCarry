import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const tripSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  travel_date: z.string().min(1, "Travel date is required"),
  total_weight_kg: z.coerce
    .number()
    .positive("Weight must be greater than 0")
    .max(100, "Maximum weight is 100 kg"),
  price_per_kg: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(10000, "Maximum price is 10,000"),
  notes: z.string().default(""),
});

export const bookingRequestSchema = z.object({
  title: z.string().min(2, "Parcel title is required"),
  description: z.string().default(""),
  weight_kg: z.coerce
    .number()
    .positive("Weight must be greater than 0"),
});

export const deliveryConfirmSchema = z.object({
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only digits"),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").default(""),
  avatar_url: z.string().default(""),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

export const kycUploadSchema = z.object({
  document_type: z.enum(["passport", "national_id", "drivers_license"], {
    message: "Please select a document type",
  }),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required").max(5),
  comment: z.string().max(1000, "Comment must be under 1000 characters").default(""),
});

export const reportSchema = z.object({
  reason: z.enum(
    [
      "inappropriate_behavior",
      "fraud_or_scam",
      "prohibited_items",
      "harassment",
      "fake_identity",
      "no_show",
      "other",
    ],
    { message: "Please select a reason" }
  ),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(2000),
});

export const kycReviewSchema = z.object({
  review_status: z.enum(["approved", "rejected"]),
  reviewer_notes: z.string().max(1000).default(""),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type TripFormData = z.infer<typeof tripSchema>;
export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;
export type DeliveryConfirmFormData = z.infer<typeof deliveryConfirmSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type KycUploadFormData = z.infer<typeof kycUploadSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type KycReviewFormData = z.infer<typeof kycReviewSchema>;
