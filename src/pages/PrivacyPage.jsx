import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>Privacy Policy</span>
        <div />
      </div>
      <div style={{ padding: 16, lineHeight: 1.7, fontSize: 14, color: 'var(--text-2)' }}>
        <h2 style={{ color: 'var(--text-1)', marginBottom: 8 }}>Famous World Privacy Policy</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 20 }}>Last updated: June 2026</p>

        {[
          { title: 'Information We Collect', body: 'We collect information you provide when creating an account (name, username, email, phone, country), content you post, and usage data such as interactions, device type, and IP address.' },
          { title: 'How We Use Your Information', body: 'Your information is used to provide and improve Famous World services, personalize your experience, send notifications, ensure platform safety, and display relevant content.' },
          { title: 'Data Sharing', body: 'We do not sell your personal data. We may share anonymized, aggregated data for analytics. We share data with service providers who assist in operating our platform under strict confidentiality agreements.' },
          { title: 'Cookies & Tracking', body: 'We use local storage to keep you logged in. We may use analytics tools to understand usage patterns. You can clear your browser data at any time to remove stored information.' },
          { title: 'Data Security', body: 'We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We encourage you to use strong, unique passwords.' },
          { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data. You can deactivate your account by contacting Famous World Support. Some data may be retained for legal or safety reasons.' },
          { title: 'Children\'s Privacy', body: 'Famous World is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information.' },
          { title: 'Changes to This Policy', body: 'We may update this Privacy Policy periodically. We will notify you of significant changes through the app. Continued use after changes indicates acceptance.' },
          { title: 'Contact Us', body: 'For privacy concerns or requests, message the Famous World Support account within the app.' },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <h3 style={{ color: 'var(--text-1)', fontSize: 15, marginBottom: 6 }}>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
