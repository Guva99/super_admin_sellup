# Sellup Console

Админ-консоль на React 19 + Vite + Tailwind CSS v4 (проект Figma Make).

## Стек

- React 19 / React DOM 19
- Vite 8, TypeScript 5.7
- Tailwind CSS v4 (плагин `@tailwindcss/vite`)
- recharts — графики, lucide-react — иконки
- oxfmt — форматирование

## Запуск

```bash
pnpm install
pnpm dev       # dev-сервер
pnpm build     # production-сборка в dist/
pnpm preview   # локальный просмотр сборки
pnpm format    # форматирование
```

## Структура

Feature-Sliced Design в `src/`:

- `app/` — инициализация приложения
- `pages/` — страницы
- `widgets/` — составные блоки интерфейса
- `features/` — пользовательские сценарии
- `entities/` — бизнес-сущности
- `shared/` — переиспользуемые UI и утилиты
