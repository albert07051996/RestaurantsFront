# პროექტის გამოყენების ინსტრუქცია

## 1. Mock API-ით მუშაობა (Backend-ის გარეშე)

თუ არ გაქვს Backend API, შეგიძლია გამოიყენო Mock მონაცემები:

### menuSlice.ts-ში:

```typescript
// ამის ნაცვლად:
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async () => {
    const response = await axios.get<MenuItem[]>(`${API_BASE_URL}/menu`);
    return response.data;
  }
);

// გამოიყენე ეს:
import { mockAPI } from '../api/mockData';

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async () => {
    return await mockAPI.getMenuItems();
  }
);

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async () => {
    return await mockAPI.getCategories();
  }
);

export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id'>) => {
    return await mockAPI.addMenuItem(item);
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem) => {
    return await mockAPI.updateMenuItem(item);
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteItem',
  async (id: string) => {
    await mockAPI.deleteMenuItem(id);
    return id;
  }
);
<!-- ``` -->

<!-- ## 2. რეალური Backend API-ით მუშაობა

### ASP.NET Core Backend მაგალითი:

#### MenuItem.cs მოდელი: -->
<!-- 
```csharp
public class MenuItem
{
    public Guid Id { get; set; }
    public string NameKa { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string DescriptionKa { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public int? PreparationTimeMinutes { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string Volume { get; set; } = string.Empty;
    public string AlcoholContent { get; set; } = string.Empty;
    public string Ingredients { get; set; } = string.Empty;
    public string IngredientsEn { get; set; } = string.Empty;
    public bool IsVeganFood { get; set; } = false;
    public string Comment { get; set; } = string.Empty;
    public int? Calories { get; set; }
    public int? SpicyLevel { get; set; }
    public Guid FoodCategoryId { get; set; }
    public FoodCategory FoodCategory { get; set; } = null!;
}
```

#### MenuController.cs:

```csharp
[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItemDto>>> GetAll()
    {
        var items = await _menuService.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MenuItemDto>> GetById(Guid id)
    {
        var item = await _menuService.GetByIdAsync(id);
        if (item == null)
            return NotFound();
        
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<MenuItemDto>> Create(CreateMenuItemDto dto)
    {
        var item = await _menuService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MenuItemDto>> Update(Guid id, UpdateMenuItemDto dto)
    {
        var item = await _menuService.UpdateAsync(id, dto);
        if (item == null)
            return NotFound();
        
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _menuService.DeleteAsync(id);
        if (!result)
            return NotFound();
        
        return NoContent();
    }
}
```

#### DTOs:

```csharp
// DTO-ს დააკონვერტირე React TypeScript ინტერფეისში
public record MenuItemDto
{
    public Guid Id { get; init; }
    public string NameKa { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    // ... დანარჩენი ველები
}
```

#### CORS კონფიგურაცია Program.cs-ში:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ...

app.UseCors("AllowReact");
```

## 3. Environment Variables

შექმენი `.env` ფაილი პროექტის Root-ში:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

და გამოიყენე `menuSlice.ts`-ში:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

## 4. TypeScript ტიპების სინქრონიზაცია

Backend-თან სინქრონიზაციისთვის:

### React-ში (`src/types/menu.ts`):

```typescript
export interface MenuItem {
    id: string;  // Frontend-ში string-ად ვიყენებთ Guid-ს
    nameKa: string;
    nameEn: string;
    // ...
}
```

### C#-ში (`MenuItem.cs`):

```csharp
public class MenuItem
{
    public Guid Id { get; set; }  // Backend-ში Guid
    public string NameKa { get; set; }
    public string NameEn { get; set; }
    // ...
}
```

გადაყავი Guid → string და string → Guid კონვერტაცია API calls-ში.

## 5. გაშვების თანმიმდევრობა

1. **Backend-ის გაშვება:**
```bash
cd YourBackendProject
dotnet run
```

2. **Frontend-ის გაშვება:**
```bash
cd restaurant-menu
npm run dev
```

3. გახსენი ბრაუზერში: `http://localhost:5173`

## 6. Troubleshooting

### CORS Error:
- დარწმუნდი რომ Backend-ზე CORS სწორად არის კონფიგურირებული
- შეამოწმე რომ Frontend port-ი (5173) დამატებულია CORS policy-ში

### API Connection Error:
- შეამოწმე რომ Backend გაშვებულია
- გადაამოწმე API_BASE_URL სწორია თუ არა
- გამოიყენე Browser DevTools → Network tab შესამოწმებლად

### TypeScript Errors:
- გაუშვი: `npm install`
- დარწმუნდი რომ ყველა dependency დაინსტალირებულია -->
