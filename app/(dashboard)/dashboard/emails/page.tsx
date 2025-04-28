// pages/dashboard/team.tsx
"use client";

// import React from "react";
// import EmailBuilder from "@/components/events/EmailBuilder";

// export default function EmailsPage() {
//   return <EmailBuilder />;
// }

import MyEmailEditor from '@/components/email/EmailEditor'

export default function EmailsPage() {
  return (
    <main>
      <MyEmailEditor />
    </main>
  )
}
