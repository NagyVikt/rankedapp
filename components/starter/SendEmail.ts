"use server"; // This directive marks this file as a Server Action file

import { Resend } from "resend";
import { redirect } from 'next/navigation';

// Initialize Resend with your API key from environment variables
// Make sure RESEND_API_KEY is set in your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

// EMAIL SENDING FUNCTIONALITY
// This function is a Server Action that handles sending the email.
// It is typed to return Promise<void> to be compatible with the form's action prop.
export const SendEmail = async (formdata: FormData): Promise<void> => {
  const message = formdata.get("message");
  const name = formdata.get("name");
  const SenderEmail = formdata.get("SenderEmail");

  // Basic validation for the message field
  // Note: If validation fails, we don't return an error object here
  // because the form's action prop expects void.
  // More sophisticated error handling for the user would require
  // using a hook like `useFormState` in the client component.
  if (!message || typeof message !== 'string' || message.trim() === '') {
    // In a real application, you might log this error or handle it differently
    // if not using useFormState to communicate back to the client.
    console.error("Invalid or empty message received.");
    // Optionally, redirect even on validation failure, or throw an error
    // if you have error handling middleware.
    // For now, we'll just stop execution here for an invalid message.
    return; // Return void as expected by the form action prop
  }

  try {
    // Send the email using Resend
    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Use a verified domain or onboarding@resend.dev
      to: `mdtaqui.jhar@gmail.com`, // Replace with your recipient email address
      subject: `${name} From Contact Form.`,
      reply_to: `${SenderEmail}`,
      text: `sender email: ${SenderEmail}\n\n${message}`, // Use \n for newlines in plain text
    });

    // Redirect to the home page upon successful email sending
    redirect('/');

  } catch (error) {
    // Log the error if email sending fails
    console.error("Error sending email:", error);
    // You might want to redirect to an error page or handle this differently
    // if not using useFormState to show feedback to the user.
    // Throwing an error here would also work if you have error boundaries set up.
    throw error; // Re-throw the error after logging
  }
};
