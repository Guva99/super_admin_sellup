import { describeApiError, type ApiError } from "@/shared/api";

/**
 * Ответы бэкенда блога по-русски. У проверки статьи текст свой на каждое
 * поле (`invalid blog post: …`), поэтому сверяем по началу, а не целиком.
 */
const BLOG_MESSAGES: Array<[string, string]> = [
  ["a post with this address already exists", "Статья с таким адресом уже есть — поменяйте адрес"],
  ["an image must be PNG, JPEG, WebP or GIF", "Картинка — PNG, JPEG, WebP или GIF до 5 МБ"],
  ["invalid blog post: slug", "Адрес — латиница, цифры и дефисы, до 100 знаков"],
  ["invalid blog post: title is required", "Укажите заголовок статьи"],
  ["invalid blog post: a post needs text", "Перед публикацией напишите текст статьи"],
  ["invalid blog post: faq: every question", "У каждого вопроса должен быть ответ"],
  ["invalid blog post: faq:", "Вопросов не больше 30; вопрос — до 300 знаков, ответ — до 4000"],
  ["invalid blog post: an image must be uploaded", "Картинка ещё не загрузилась — подождите и сохраните снова"],
  ["invalid blog post: unsupported block", "В тексте есть блок, который сайт не покажет, — удалите его"],
  ["invalid blog post: coverImageId", "Обложка не найдена — загрузите её заново"],
  ["invalid blog post: coverScene", "Такой анимации сайт не знает — выберите другую"],
  ["invalid blog post: content is larger", "Статья слишком большая — больше 1 МБ"],
  ["invalid blog post:", "Проверьте поля статьи"],
];

export function describeBlogError(error: ApiError): string {
  const found = BLOG_MESSAGES.find(([prefix]) => error.message.startsWith(prefix));
  return found ? found[1] : describeApiError(error);
}
