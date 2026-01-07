# 🚀 სწრაფი დაწყება

## პირველი ნაბიჯები

### 1️⃣ პროექტის გაშვება (5 წუთი)

```bash
# გადადი პროექტის დირექტორიაში
cd restaurant-menu

# დააინსტალირე დამოკიდებულებები
npm install

# გაუშვი დეველოპმენტ სერვერი
npm run dev
```

ახლა გახსენი ბრაუზერში: **http://localhost:5173**

### 2️⃣ რას დაინახავ

✅ მენიუს სამი სადემონსტრაციო კერძი  
✅ კატეგორიების ფილტრი  
✅ ენის გადართვა (ქართული/ინგლისური)  
✅ "ახალი კერძის" დამატების ღილაკი

### 3️⃣ ფუნქციების ტესტირება

1. **დაამატე ახალი კერძი:**
   - დააჭირე "ახალი კერძი" ღილაკს
   - შეავსე ფორმა (მინიმუმ სახელი და კატეგორია)
   - დააჭირე "შენახვა"

2. **დაარედაქტირე კერძი:**
   - დააჭირე ✏️ (რედაქტირება) იკონას ბარათზე
   - შეცვალე ინფორმაცია
   - შეინახე ცვლილებები

3. **წაშალე კერძი:**
   - დააჭირე 🗑️ (წაშლა) იკონას
   - დაადასტურე წაშლა

### 4️⃣ Backend-თან დაკავშირება

#### თუ გაქვს ASP.NET Core Backend:

**menuSlice.ts**-ში (ხაზი 11) შეცვალე:
```typescript
const API_BASE_URL = 'http://localhost:5000/api'; // შენი Backend-ის მისამართი
```

**Backend-ზე დაამატე CORS:**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

app.UseCors("AllowReact");
```

#### თუ არ გაქვს Backend:

არაფერი არ გჭირდება! პროექტი იმუშავებს Mock მონაცემებით.  
იხილე `src/api/mockData.ts` - აქ შეგიძლია დაამატო სხვა სადემონსტრაციო კერძები.

## 📁 მთავარი ფაილები

| ფაილი | რა არის |
|-------|---------|
| `src/components/MenuList.tsx` | მთავარი გვერდი |
| `src/components/MenuItemCard.tsx` | კერძის ბარათი |
| `src/components/MenuItemForm.tsx` | დამატების ფორმა |
| `src/store/menuSlice.ts` | Redux state მენეჯმენტი |
| `src/types/menu.ts` | TypeScript ტიპები |
| `src/api/mockData.ts` | Mock მონაცემები |

## 🔧 კასტომიზაცია

### შეცვალე აპლიკაციის სახელი
**index.html** (ხაზი 7):
```html
<title>შენი რესტორნის სახელი</title>
```

### დაამატე კატეგორიები
**src/api/mockData.ts**:
```typescript
export const mockCategories: FoodCategory[] = [
  { id: '1', nameKa: 'ცხელი კერძები', nameEn: 'Hot Dishes' },
  { id: '5', nameKa: 'პიცა', nameEn: 'Pizza' }, // ახალი კატეგორია
];
```

### დაამატე Mock კერძები
**src/api/mockData.ts**-ში `mockMenuItems` მასივში:
```typescript
{
  id: '4',
  nameKa: 'მარგარიტა პიცა',
  nameEn: 'Margherita Pizza',
  // ... სხვა ველები
}
```

## ❓ ხშირი პრობლემები

### პორტი დაკავებულია?
```bash
# შეცვალე პორტი vite.config.ts-ში
export default defineConfig({
  server: { port: 3000 }
})
```

### ცვლილებები არ ჩანს?
```bash
# წაშალე cache და restart
rm -rf node_modules
npm install
npm run dev
```

### TypeScript შეცდომები?
ყველა ფაილი უნდა იყოს შენახული და `npm install` გაშვებული.

## 📚 დამატებითი ინფორმაცია

- **სრული დოკუმენტაცია:** README.md
- **Backend ინტეგრაცია:** USAGE.md
- **Ant Design კომპონენტები:** https://ant.design/components/
- **Redux Toolkit:** https://redux-toolkit.js.org/

---

**წარმატებები! 🎉**

თუ რაიმე პრობლემა გაქვს, შეამოწმე `README.md` და `USAGE.md` ფაილები დეტალური ინსტრუქციებისთვის.
