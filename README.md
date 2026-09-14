# Sellup Console

Админ-консоль на React 19 + Vite + Tailwind CSS v4 (проект Figma Make).

## Стек

- React 19 / React DOM 19
- react-router-dom 7 — навигация
- Vite 8, TypeScript 5.9
- Tailwind CSS v4 (плагин `@tailwindcss/vite`)
- recharts — графики, lucide-react — иконки
- oxfmt — форматирование

## Запуск

```bash
pnpm install
pnpm dev        # dev-сервер
pnpm typecheck  # проверка типов
pnpm build      # typecheck + production-сборка в dist/
pnpm preview    # локальный просмотр сборки
pnpm format     # форматирование
```

## Структура

Feature-Sliced Design в `src/`:

- `app/` — роутер, провайдеры, каркас интерфейса
- `pages/` — страницы
- `widgets/` — составные блоки интерфейса
- `features/` — пользовательские сценарии
- `entities/` — бизнес-сущности и их состояние
- `shared/` — переиспользуемые UI и утилиты

Правила работы с кодом, устройство состояния и навигации, порядок добавления
раздела или сущности — в [AGENTS.md](AGENTS.md).

## Данные

С бэкендом (`backend/`, адрес — `VITE_API_URL`, см. `.env.example`) работают вход и
выход, клиенты (подключение бизнеса, воронка, этапы онбординга) и тарифы. Задачи,
аналитика дашборда и остальные экраны пока на фикстурах.

Вход по умолчанию: `admin@sellup.local` / `ChangeMe123!`.

## Документы

- [docs/operator-console-spec.md](docs/operator-console-spec.md) — исходное ТЗ
  на консоль (8 экранов, требования к дизайну)
