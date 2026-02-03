import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'LogoList - Download Free Company Logos'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        padding: '60px 80px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '20px',
                        }}
                    >
                        Logo<span style={{ color: '#2563eb' }}>List</span>
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            color: '#6b7280',
                            textAlign: 'center',
                            maxWidth: '600px',
                        }}
                    >
                        Download Free Company Logos in PNG, SVG & Vector Formats
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '40px',
                            marginTop: '40px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                            <span style={{ fontSize: 24 }}>✓</span>
                            <span style={{ fontSize: 20 }}>1000+ Logos</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                            <span style={{ fontSize: 24 }}>✓</span>
                            <span style={{ fontSize: 20 }}>Free Download</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                            <span style={{ fontSize: 24 }}>✓</span>
                            <span style={{ fontSize: 20 }}>High Quality</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
