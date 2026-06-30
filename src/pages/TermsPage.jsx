import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>Terms & Conditions</span>
        <div />
      </div>
      <div style={{ padding: 16, lineHeight: 1.7, fontSize: 14, color: 'var(--text-2)' }}>
        <h2 style={{ color: 'var(--text-1)', marginBottom: 8 }}>Famous World Terms of Service</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 20 }}>Last updated: June 2026</p>

        {[
          { title: '1. Acceptance of Terms', body: 'By accessing or using Famous World, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.' },
          { title: '2. Eligibility', body: 'You must be at least 13 years of age to use Famous World. By creating an account, you confirm that you meet this requirement.' },
          { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify Famous World immediately of any unauthorized use of your account. Each person may only maintain one account.' },
          { title: '4. Content Guidelines', body: 'You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. Famous World reserves the right to remove any content that violates these guidelines.' },
          { title: '5. Celebrity Accounts', body: 'Usernames resembling public figures are reserved. Claiming a celebrity account requires verification through our support team. Impersonation of real persons is strictly prohibited.' },
          { title: '6. Famous Coins', body: 'Famous Coins are earned through platform engagement (likes, views, shares) and can be used to promote content. Coins have no monetary value and cannot be exchanged for real currency. Famous World reserves the right to adjust coin distribution at any time.' },
          { title: '7. Verification Badges', body: 'Verification badges are granted at the discretion of Famous World. A blue badge is awarded at 1 million followers. Colored badges may be earned at higher follower counts. Badges can be removed for violations of these terms.' },
          { title: '8. Privacy', body: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.' },
          { title: '9. Intellectual Property', body: 'Content you post remains your intellectual property. By posting, you grant Famous World a non-exclusive license to display your content on the platform.' },
          { title: '10. Limitation of Liability', body: 'Famous World is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.' },
          { title: '11. Changes to Terms', body: 'Famous World reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
          { title: '12. Contact', body: 'For questions about these Terms, contact us through the Famous World Support account within the app.' },
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
