# פתרון בעיות - Google Calendar Integration

## שגיאת "invalid_client" (Error 401)

אם אתה מקבל שגיאה זו, זה אומר שה-Client ID לא מזוהה. בדוק את הדברים הבאים:

### 1. בדוק את ה-Client ID ב-config.js

ודא שה-Client ID נכון ונראה כך:
```
xxxxx.apps.googleusercontent.com
```

### 2. הוסף את ה-URL שלך ל-Authorized JavaScript Origins

זה החלק החשוב ביותר!

1. עבור ל-[Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. לחץ על ה-OAuth 2.0 Client ID שלך
3. גלול למטה ל-"Authorized JavaScript origins"
4. ודא ש-**`http://localhost:8000`** ברשימה (בלי סלאש בסוף!)
5. אם אין, לחץ על "+ ADD URI" והוסף:
   - `http://localhost:8000`
6. לחץ על "SAVE" בתחתית העמוד
7. חכה כמה שניות עד שהשינויים יעודכנו

### 3. בדוק את OAuth Consent Screen

1. עבור ל-[OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. ודא שהמסך מוגדר (לא ריק)
3. אם צריך, מלא:
   - App name
   - User support email
   - Developer contact information

### 4. ודא ש-Google Calendar API מופעל

1. עבור ל-[APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. חפש "Google Calendar API"
3. ודא שהוא מופעל (Enabled)

### 5. נסה שוב

1. רענן את הדף באפליקציה
2. לחץ שוב על "התחבר ל-Google"

## שגיאות נפוצות אחרות

### "Access blocked: This app's request is invalid"
- בדוק שה-Client ID נכון
- ודא ש-OAuth consent screen מוגדר

### "redirect_uri_mismatch"
- בדוק ש-Authorized JavaScript origins כולל את ה-URL הנכון
- ודא שאין סלאש בסוף (לא `http://localhost:8000/`)

### "access_denied"
- המשתמש לחץ על Cancel
- המשתמש לא נתן הרשאות

### האירועים לא נטענים
- בדוק שהתחברת לחשבון הנכון
- ודא שיש הרשאות ל-Google Calendar
- בדוק בקונסול (F12) אם יש שגיאות

## טיפים

- לאחר שינוי ב-Google Cloud Console, חכה 1-2 דקות עד שהשינויים יעודכנו
- נקה cookies ואזהרות דפדפן אם יש בעיות
- בדוק את הקונסול (F12) למידע נוסף על השגיאה

