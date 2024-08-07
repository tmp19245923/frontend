# Тестовое задание на позицию React Frontend Developer

Задача: разработать приложение для работы с тасками.

Будет оцениваться подход к заданию, качество и структура кода, внимательность.
Выложить на github. Сказать сколько примерно времени заняло.

Требования к приложению:
Приложение должно использовать подход SPA на TS React, для UI использовать библиотеку Ant Design. Страницы должны иметь небольшой layout с минимальным хедером приложения, контентом и навигацией. Можно использовать любые дополнительные библиотеки на свой выбор, указав обоснование для использования.

Страница "Вход"
Аунтификация реализована через cookie, сессии хранятся в оперативке сервера.

1. форма состоит из 2х полей - `email` и `password`
1. для поля `email` сделать валидацию
1. для формы сделать обработку ошибки входа

Страница "Таски"

1. таблица для отображения списка задач
1. все параметры пагинации, сортировки, фильтрации надо сохранять в url

Функционал таблицы

1. выводить все столбцы

1. в колонке `createData` выводит дату в формате
1. пагинация, с возможностью выбора размера страницы
1. сортировка, по возрастанию/убыванию для колонок `id`, `userId`
1. фильтрация, по колонке `user` с множественным выбором

Функционал столбцов

1. для `userId` выводит читаемые имена
1. для дат форматирование `день`.`месяц`.`год`. `час`:`минута`
1. допустимые значения для фильтрации получать из справочника
1. для сортировки учитывать колонку и порядок (активна сортировка только по 1 столбцу)

Типизацию можно посмотреть в  
`server/types.ts`

Серверная часть (API)

Устанавливается

- `npm ci`

Запускается

- `npm run server`
- проверить что работает можно в браузере по `http://localhost:3000`

Endpoints

- /api/login
- /api/logout
- /api/tickets
- /api/dictionary/users
