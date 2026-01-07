# პროექტის სტრუქტურა

```
restaurant-menu/
│
├── 📁 .vscode/                    # VS Code კონფიგურაცია
│   └── extensions.json           # რეკომენდებული გაფართოებები
│
├── 📁 src/                        # წყარო ფაილები
│   │
│   ├── 📁 api/                    # API სერვისები
│   │   └── mockData.ts           # Mock მონაცემები და API
│   │
│   ├── 📁 components/             # React კომპონენტები
│   │   ├── MenuList.tsx          # მთავარი სია კომპონენტი
│   │   ├── MenuItemCard.tsx      # კერძის ბარათი
│   │   └── MenuItemForm.tsx      # დამატება/რედაქტირების ფორმა
│   │
│   ├── 📁 store/                  # Redux store
│   │   ├── store.ts              # Store კონფიგურაცია
│   │   ├── menuSlice.ts          # Menu state slice
│   │   └── hooks.ts              # Typed Redux hooks
│   │
│   ├── 📁 types/                  # TypeScript ტიპები
│   │   └── menu.ts               # Menu ინტერფეისები
│   │
│   ├── App.tsx                    # Root კომპონენტი
│   ├── App.css                    # App სტილები
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global სტილები
│   └── vite-env.d.ts             # Vite ტიპები
│
├── 📄 index.html                  # HTML თემფლეითი
├── 📄 package.json                # დამოკიდებულებები
├── 📄 tsconfig.json               # TypeScript კონფიგურაცია
├── 📄 tsconfig.node.json          # Node TypeScript კონფიგურაცია
├── 📄 vite.config.ts              # Vite კონფიგურაცია
├── 📄 .eslintrc.json              # ESLint კონფიგურაცია
├── 📄 .prettierrc                 # Prettier კონფიგურაცია
├── 📄 .gitignore                  # Git ignore ფაილი
├── 📄 .env.example                # Environment variables მაგალითი
│
├── 📚 README.md                   # მთავარი დოკუმენტაცია
├── 📚 QUICKSTART.md               # სწრაფი დაწყების გაიდი
├── 📚 USAGE.md                    # გამოყენების ინსტრუქცია
└── 📚 PROJECT_STRUCTURE.md        # ეს ფაილი

```

## ფაილების აღწერა

### 🔧 კონფიგურაციის ფაილები

- **package.json** - npm დამოკიდებულებები და scripts
- **tsconfig.json** - TypeScript compiler options
- **vite.config.ts** - Vite bundler კონფიგურაცია
- **.eslintrc.json** - Code linting წესები
- **.prettierrc** - Code formatting წესები
- **.env.example** - Environment variables თემფლეითი

### 📦 Redux Store

#### store/store.ts
Store-ის მთავარი კონფიგურაცია:
```typescript
- Redux store setup
- Root state type export
- AppDispatch type export
```

#### store/menuSlice.ts
Menu state მართვა:
```typescript
- Menu items state
- Categories state
- Loading/Error states
- Async thunks (CRUD operations)
- Reducers (actions)
```

#### store/hooks.ts
Type-safe Redux hooks:
```typescript
- useAppDispatch - typed dispatch hook
- useAppSelector - typed selector hook
```

### 🎨 React კომპონენტები

#### components/MenuList.tsx
**მთავარი კომპონენტი:**
- მენიუს ელემენტების დარენდერება
- კატეგორიების ფილტრაცია
- ენის გადართვა
- Modal-ის მართვა (დამატება/რედაქტირება)

**Props:** არა
**State:** formVisible, editingItem
**Redux:** items, categories, loading, error

#### components/MenuItemCard.tsx
**კერძის ბარათის კომპონენტი:**
- კერძის ვიზუალური წარმოდგენა
- ინფორმაციის ჩვენება tags-ით
- რედაქტირების/წაშლის ღილაკები

**Props:**
- item: MenuItem
- language: 'ka' | 'en'
- onEdit: (item) => void
- onDelete: (id) => void

#### components/MenuItemForm.tsx
**დამატება/რედაქტირების ფორმა:**
- Modal ფორმა ყველა ველით
- Validation
- ქართული/ინგლისური ველები
- Form submission

**Props:**
- visible: boolean
- item: MenuItem | null
- categories: FoodCategory[]
- onSubmit: (values) => void
- onCancel: () => void

### 🔤 TypeScript ტიპები

#### types/menu.ts
```typescript
- FoodCategory interface
- MenuItem interface (21 ველი)
- MenuItemFormData type
```

### 🌐 API სერვისები

#### api/mockData.ts
**Mock API იმპლემენტაცია:**
- mockCategories - 4 კატეგორია
- mockMenuItems - 3 სადემონსტრაციო კერძი
- mockAPI - CRUD ფუნქციები:
  - getMenuItems()
  - getCategories()
  - addMenuItem()
  - updateMenuItem()
  - deleteMenuItem()

### 📝 სტილები

#### App.css
- Global resets
- Card styling
- Action button styling

#### index.css
- Root variables
- Base styling
- Typography

## კომპონენტების ურთიერთქმედება

```
App.tsx
  └─> MenuList.tsx (Redux: store)
        │
        ├─> MenuItemCard.tsx (map items)
        │     └─> onEdit, onDelete callbacks
        │
        └─> MenuItemForm.tsx (modal)
              └─> onSubmit callback
```

## Redux Data Flow

```
Component Action
     ↓
  Dispatch
     ↓
Async Thunk (API call)
     ↓
   Reducer
     ↓
Store State Update
     ↓
Component Re-render (useAppSelector)
```

## ფაილური ზომები

| ფაილი | ხაზები | კომპლექსურობა |
|-------|--------|---------------|
| MenuList.tsx | ~200 | High |
| MenuItemCard.tsx | ~130 | Medium |
| MenuItemForm.tsx | ~180 | High |
| menuSlice.ts | ~160 | High |
| mockData.ts | ~100 | Low |
| menu.ts | ~30 | Low |

## დამატება/მოდიფიკაცია

### ახალი ველის დამატება MenuItem-ში:

1. **types/menu.ts** - დაამატე ინტერფეისში
2. **components/MenuItemForm.tsx** - დაამატე Form.Item
3. **components/MenuItemCard.tsx** - დაამატე ჩვენება
4. **api/mockData.ts** - განაახლე mock data

### ახალი კომპონენტის დამატება:

1. შექმენი `src/components/YourComponent.tsx`
2. Import MenuList.tsx-ში (თუ საჭიროა)
3. დაამატე Redux state (თუ საჭიროა)

### ახალი Redux slice-ის დამატება:

1. შექმენი `src/store/yourSlice.ts`
2. Import store.ts-ში:
```typescript
import yourReducer from './yourSlice';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    your: yourReducer, // დაამატე აქ
  },
});
```
