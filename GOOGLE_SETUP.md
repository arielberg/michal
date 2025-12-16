# Google Calendar API Setup Instructions

## שלבי הגדרה

### 1. יצירת פרויקט ב-Google Cloud Console

1. עבור ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש או בחר פרויקט קיים
3. שים לב למספר הפרויקט (תצטרך אותו בהמשך)

### 2. הפעלת Google Calendar API

1. בחר את הפרויקט שלך
2. עבור ל-[Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
3. לחץ על "Enable" להפעלת ה-API

### 3. יצירת OAuth 2.0 Client ID

1. עבור ל-[Credentials](https://console.cloud.google.com/apis/credentials)
2. לחץ על "Create Credentials" > "OAuth client ID"
3. אם זו הפעם הראשונה, תצטרך להגדיר OAuth consent screen:
   - בחר "External" (או "Internal" אם יש לך Google Workspace)
   - מלא את השם של האפליקציה
   - הוסף את האימייל שלך כמגע
   - שמור והמשך
4. עבור ליצירת Client ID:
   - Application type: **Web application**
   - Name: שם האפליקציה שלך (למשל: "רישום לידות 2026")
   - Authorized JavaScript origins:
     - `http://localhost:8000` (לפיתוח מקומי)
     - `https://yourdomain.com` (לייצור, אם יש לך דומיין)
   - Authorized redirect URIs: השאר ריק (לא נדרש עבור OAuth2 token flow)
5. לחץ על "Create"
6. העתק את ה-**Client ID** (נראה כמו: `xxxxx.apps.googleusercontent.com`)

### 4. קבלת API Key (אופציונלי)

1. באותו דף Credentials
2. לחץ על "Create Credentials" > "API Key"
3. העתק את המפתח (נראה כמו: `AIza...`)

### 5. עדכון הקובץ config.js

1. פתח את הקובץ `config.js`
2. החלף את הערכים הבאים:

```javascript
const GOOGLE_CONFIG = {
    CLIENT_ID: 'הדבק כאן את ה-Client ID שלך',
    CALENDAR_ID: 'primary', // או ID של לוח שנה ספציפי
    API_KEY: 'הדבק כאן את ה-API Key שלך (אופציונלי)',
    SCOPES: 'https://www.googleapis.com/auth/calendar',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};
```

### 6. הוספת כתובת לייצור (אם יש לך)

אם יש לך דומיין לייצור:
1. חזור ל-Credentials > OAuth 2.0 Client ID שלך
2. לחץ על "Edit"
3. הוסף ב-Authorized JavaScript origins:
   - `https://yourdomain.com`
4. שמור

## שימוש

1. הפעל את השרת המקומי: `python3 server.py`
2. פתח את הדפדפן בכתובת: `http://localhost:8000`
3. לחץ על "התחבר ל-Google"
4. היכנס לחשבון Google שלך
5. אשר את ההרשאות
6. האפליקציה תתחיל לטעון את האירועים מ-Google Calendar

## הערות חשובות

- כל הרשומות נשמרות כ-אירועים ב-Google Calendar שלך
- כל אירוע מתחיל ב-"לידה: " כדי לזהות אותו
- הנתונים המלאים נשמרים ב-extendedProperties של האירוע
- ניתן לראות ולערוך את האירועים גם ב-Google Calendar עצמו
- האירועים מוגבלים לשנת 2026 בלבד

## פתרון בעיות

### שגיאת "Not signed in"
- ודא שה-Client ID מוגדר נכון ב-config.js
- ודא שה-API מופעל ב-Google Cloud Console
- ודא שה-JavaScript origins מוגדר נכון

### שגיאת "Access denied"
- ודא ש-Google Calendar API מופעל
- ודא שה-OAuth consent screen מוגדר נכון
- נסה למחוק cookies ולהתחבר מחדש

### האירועים לא מופיעים
- ודא שהתחברת לחשבון הנכון
- בדוק ב-Google Calendar אם האירועים נוצרו
- ודא שהאירועים מתחילים ב-"לידה:"

