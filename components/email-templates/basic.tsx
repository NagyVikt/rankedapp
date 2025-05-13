// components/email-templates/basic.tsx
import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

export function BasicNewsletter({ title = 'Hello!' }) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body>
        <Container>
          <Section>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{title}</Text>
            <Text>Welcome to our newsletter. Click below to learn more.</Text>
            <Button href="https://example.com">Learn More</Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
