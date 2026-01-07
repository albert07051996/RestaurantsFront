# რესტორნის მენიუს აპლიკაცია

React აპლიკაცია რესტორნის მენიუს მართვისთვის Redux Toolkit, TypeScript და Ant Design-ით.

## ტექნოლოგიები

- **React 18** - UI ბიბლიოთეკა
- **TypeScript** - Type-safe დეველოპმენტი
- **Redux Toolkit** - State მენეჯმენტი
- **Ant Design 5** - UI კომპონენტები
- **Vite** - Build ხელსაწყო
- **Axios** - HTTP კლიენტი

## ფუნქციონალი

- ✅ მენიუს ელემენტების ნახვა Grid ფორმატში
- ✅ მენიუს ელემენტების დამატება
- ✅ მენიუს ელემენტების რედაქტირება
- ✅ მენიუს ელემენტების წაშლა
- ✅ კატეგორიების მიხედვით ფილტრაცია
- ✅ ქართული/ინგლისური ენის მხარდაჭერა
- ✅ Responsive დიზაინი
- ✅ სრული ინფორმაცია კერძებზე:
  - სახელი და აღწერა (ორ ენაზე)
  - ფასი
  - ფოტო და ვიდეო
  - მომზადების დრო
  - ხელმისაწვდომობა
  - მოცულობა
  - ალკოჰოლის შემცველობა
  - ინგრედიენტები
  - ვეგანური ნიშანი
  - კალორიები
  - სიცხის დონე
  - კომენტარები

## პროექტის სტრუქტურა

```
restaurant-menu/
├── src/
│   ├── components/          # React კომპონენტები
│   │   ├── MenuList.tsx    # მთავარი გვერდი
│   │   ├── MenuItemCard.tsx # მენიუს ბარათი
│   │   └── MenuItemForm.tsx # დამატების/რედაქტირების ფორმა
│   ├── store/              # Redux store
│   │   ├── store.ts        # Store კონფიგურაცია
│   │   ├── menuSlice.ts    # Menu slice
│   │   └── hooks.ts        # Typed hooks
│   ├── types/              # TypeScript ტიპები
│   │   └── menu.ts         # Menu ტიპები
│   ├── api/                # API ფუნქციები
│   │   └── mockData.ts     # Mock მონაცემები (დეველოპმენტისთვის)
│   ├── App.tsx             # Root კომპონენტი
│   ├── App.css             # სტილები
│   ├── main.tsx            # Entry point
│   └── index.css           # Global სტილები
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ინსტალაცია და გაშვება

### 1. დაინსტალირე დამოკიდებულებები

```bash
cd restaurant-menu
npm install
```

### 2. გაუშვი Development სერვერი

```bash
npm run dev
```

აპლიკაცია გაიშვება `http://localhost:5173`

### 3. Build Production-ისთვის

```bash
npm run build
```

## Backend API ინტეგრაცია

ამჟამად პროექტი იყენებს Mock მონაცემებს. რეალურ API-სთან დასაკავშირებლად:

### 1. განაახლე API endpoint `src/store/menuSlice.ts`-ში:

```typescript
const API_BASE_URL = 'https://your-api-url.com/api';
```

### 2. შექმენი შესაბამისი API endpoints თქვენს Backend-ზე:

- `GET /api/menu` - ყველა მენიუს ელემენტის მიღება
- `GET /api/categories` - კატეგორიების მიღება
- `POST /api/menu` - ახალი ელემენტის დამატება
- `PUT /api/menu/:id` - ელემენტის განახლება
- `DELETE /api/menu/:id` - ელემენტის წაშლა

### მაგალითი C# API Controller-ი:

```csharp
[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems()
    {
        // დააბრუნე მენიუს ელემენტები
    }

    [HttpPost]
    public async Task<ActionResult<MenuItem>> CreateMenuItem(MenuItem item)
    {
        // შექმენი ახალი ელემენტი
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MenuItem>> UpdateMenuItem(Guid id, MenuItem item)
    {
        // განაახლე ელემენტი
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenuItem(Guid id)
    {
        // წაშალე ელემენტი
    }
}
```

## ძირითადი კომპონენტები

### MenuList
მთავარი კომპონენტი რომელიც:
- გამოაქვს ყველა მენიუს ელემენტი
- უზრუნველყოფს კატეგორიების ფილტრაციას
- მართავს ენის გადართვას
- ხსნის დამატების/რედაქტირების მოდალს

### MenuItemCard
მენიუს ელემენტის ბარათი რომელიც:
- აჩვენებს კერძის ინფორმაციას
- უზრუნველყოფს რედაქტირებას და წაშლას
- მხარს უჭერს Image Preview-ს

### MenuItemForm
მოდალური ფორმა რომელიც:
- უზრუნველყოფს ახალი კერძის დამატებას
- რედაქტირებას
- ვალიდაციას
- ორენოვან ინფორმაციას

## Redux State Management

### State სტრუქტურა:

```typescript
{
  items: MenuItem[],           // ყველა მენიუს ელემენტი
  categories: FoodCategory[],  // კატეგორიები
  loading: boolean,            // Loading მდგომარეობა
  error: string | null,        // Error message
  selectedCategory: string | null,  // არჩეული კატეგორია
  selectedLanguage: 'ka' | 'en'     // არჩეული ენა
}
```

### Actions:

- `fetchMenuItems()` - მენიუს ჩატვირთვა
- `fetchCategories()` - კატეგორიების ჩატვირთვა
- `addMenuItem()` - ახალი ელემენტის დამატება
- `updateMenuItem()` - ელემენტის განახლება
- `deleteMenuItem()` - ელემენტის წაშლა
- `setSelectedCategory()` - კატეგორიის ფილტრი
- `setLanguage()` - ენის შეცვლა

## გაფართოების შესაძლებლობები

1. **ძიების ფუნქციონალი** - დაამატე ძიების ველი
2. **ფილტრაცია** - დამატებითი ფილტრები (ფასი, კალორიები, ვეგანური)
3. **Image Upload** - ფოტოს ატვირთვის ფუნქციონალი
4. **Pagination** - დიდი მონაცემების შემთხვევაში
5. **Authentication** - ადმინის პანელისთვის
6. **Print Menu** - მენიუს ბეჭდვის ფუნქციონალი
7. **QR Code** - მენიუს QR კოდის გენერაცია

## მხარდაჭერა

თუ რაიმე პრობლემა გაქვს ან კითხვები, შექმენი Issue GitHub-ზე.

## ლიცენზია

MIT
