import Link from 'next/link'

/**
 * 404 Not Found page
 * Shown when user navigates to an invalid URL
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light to-blue-50"
      dir="rtl"
    >
      <div className="text-center px-6">
        <div className="text-6xl font-black text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-dark mb-2">העמוד לא נמצא</h1>
        <p className="text-muted text-lg mb-8 leading-relaxed">
          אנחנו לא מצאנו את העמוד שחיפשת. בדוק את הכתובת והנסה שוב.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            חזור לעמוד הבית
          </Link>
          <Link
            href="/student-profile"
            className="px-6 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            לפרופיל שלי
          </Link>
        </div>

        {/* Error Details */}
        <div className="mt-12 p-6 rounded-lg bg-white/50 backdrop-blur border border-white/80 max-w-md mx-auto">
          <h3 className="font-semibold text-dark mb-2">סרטונים שימושיים:</h3>
          <ul className="text-sm text-muted space-y-2 text-right">
            <li>• בדוק את הכתובת (URL) בשורה הגבוהה</li>
            <li>• נסה להחזיר את הדף לאחור ולנסות שוב</li>
            <li>• אם הבעיה נמשכת, צור קשר עם התמיכה</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
