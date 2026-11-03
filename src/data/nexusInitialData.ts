import { 
  NexusTask, 
  WishlistItem, 
  FinanceTransaction, 
  JointBudget, 
  CashbackCard, 
  UtilityBill, 
  StudyWorkItem,
  CoupleGamification,
  GCalEvent
} from '../types/nexus';

export const initialCoupleGamification: CoupleGamification = {
  level: 4,
  levelTitle: 'Дримтим Архитекторы Уюта',
  xp: 740,
  nextLevelXp: 1000,
  treats: 18,
  hungerLevel: 85,
  equippedCosmetic: 'crown',
  unlockedCosmetics: ['none', 'crown', 'glasses', 'scarf', 'cat_headphones', 'wings'],
};

export const initialTasks: NexusTask[] = [
  {
    "id": "6ade5432e9a77a0000000f93",
    "title": "Мосэнергосбыт: электричество  ПОКАЗАНИЯ - передано",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "2026-11-02",
    "isOverdue": true,
    "isRegular": true,
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T19:10:42.000+0000",
    "order": 0,
    "tags": [
      "жкх",
      "показания"
    ],
    "notes": "Логин: olika\\-lelika@ya\\.ru\nПароль: ••••••••",
    "regularPeriod": "15–26 числа каждого месяца",
    "parentId": "6ade5410e9a77a0000000f79"
  },
  {
    "id": "6ae5f0b4a8343da54fbf6f07",
    "title": "Клей. Крючок в ванной",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-31T13:44:20.000+0000",
    "order": 1,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ade4840e9a77a0000000701",
    "title": "ванная",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:19:44.000+0000",
    "order": 3,
    "tags": [
      "ванная"
    ],
    "isHub": true,
    "subtaskCount": 7
  },
  {
    "id": "6ade54e9e9a77a0000000fb6",
    "title": "ЛК Wi-Fi - посмотреть что тут",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T19:13:45.000+0000",
    "order": 5,
    "tags": [
      "финансы"
    ],
    "notes": "Сайт: lk.formula-start.ru\nИмя пользователя: F-908944-160926\nпароль: ••••••••\n\nоплатила 740",
    "parentId": "6ade5410e9a77a0000000f79"
  },
  {
    "id": "6ade543ae9a77a0000000f9a",
    "title": "ЕПД mos.ru/Квитанция: кап.ремонт, ТКО - оплачено",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T19:10:50.000+0000",
    "order": 7,
    "tags": [
      "финансы"
    ],
    "notes": "Период: сентябрь\n- кап.ремонт: 779,86\n- ТКО: 201,48\nИтого по квитанции за сент: 981,34\n\nможно чеерез mos.ru\nКод плательщика: 4191105056",
    "parentId": "6ade5410e9a77a0000000f79"
  },
  {
    "id": "6ade5413e9a77a0000000f7f",
    "title": "Домиленд: вода гор, хол; отопление: ; комм.усл.: 1668.72 + 16.69(комиссия) сейчас",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T19:10:11.000+0000",
    "order": 9,
    "tags": [
      "финансы"
    ],
    "parentId": "6ade5410e9a77a0000000f79"
  },
  {
    "id": "6ade5410e9a77a0000000f79",
    "title": "Коммунальные",
    "completed": false,
    "bracketColor": "critical",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T19:10:08.000+0000",
    "order": 11,
    "tags": [
      "финансы"
    ],
    "isHub": true,
    "subtaskCount": 4
  },
  {
    "id": "6ade4e00e9a77a0000000e5e",
    "title": "губки для посуды",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:44:16.000+0000",
    "order": 13,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ade4860e9a77a0000000716",
    "title": "доп.",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:20:16.000+0000",
    "order": 15,
    "tags": [
      "дом"
    ],
    "isHub": true,
    "subtaskCount": 8
  },
  {
    "id": "6ade4cdbe9a77a0000000dd6",
    "title": "и с кабиной разобраться- вода бежит - герметик есть",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:39:23.000+0000",
    "order": 17,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ade4cd2e9a77a0000000dd4",
    "title": "разобраться с кнопкой унитаза",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:39:14.000+0000",
    "order": 19,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ade4cb4e9a77a0000000dca",
    "title": "овощечистка",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:38:44.000+0000",
    "order": 21,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ade4853e9a77a000000070e",
    "title": "кухня",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:20:03.000+0000",
    "order": 23,
    "tags": [
      "кухня"
    ],
    "isHub": true,
    "subtaskCount": 23
  },
  {
    "id": "6ac657b23f3092eba2b02aa2",
    "title": "Тарелки плоские?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:31:14.000+0000",
    "order": 25,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac657b83f3092eba2b02ab0",
    "title": "Тарелки глубокие?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:31:20.000+0000",
    "order": 27,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac657be3f3092eba2b02abe",
    "title": "Нож еще надо?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:31:26.000+0000",
    "order": 29,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac657ec3f3092eba2b02af6",
    "title": "Поварешки, лопатка?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:32:12.000+0000",
    "order": 31,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac6587d3f3092eba2b02b82",
    "title": "Стаканы?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:34:37.000+0000",
    "order": 33,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ade4c6be9a77a0000000d9c",
    "title": "помыть балкон",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:37:31.000+0000",
    "order": 35,
    "tags": [
      "балкон"
    ],
    "parentId": "6ade4847e9a77a0000000708"
  },
  {
    "id": "6ade4847e9a77a0000000708",
    "title": "балкон",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:19:51.000+0000",
    "order": 37,
    "tags": [
      "балкон"
    ],
    "isHub": true,
    "subtaskCount": 5
  },
  {
    "id": "6ad8d043bf00032b8b10cc14",
    "title": "Что делаем 4 ноября?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:46:27.000+0000",
    "order": 39,
    "tags": [
      "дом"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8ce11bf00032b8b10cba5",
    "title": "Общий календарь",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:37:05.000+0000",
    "order": 41,
    "tags": [
      "дом"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8cca3bf00032b8b10ca21",
    "title": "Средство для сантехники",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:30:59.000+0000",
    "order": 43,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ad8cb8bbf00032b8b10c8ea",
    "title": "Помыть окна на балконе",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:26:19.000+0000",
    "order": 45,
    "tags": [
      "балкон"
    ],
    "parentId": "6ade4847e9a77a0000000708"
  },
  {
    "id": "6ad8cacebf00032b8b10c84f",
    "title": "Получить кэшбек с газпромбанка",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:23:10.000+0000",
    "order": 47,
    "tags": [
      "финансы"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8c379bf00032b8b10c7ce",
    "title": "Разобраться с финансами: перевести деньги",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T13:51:53.000+0000",
    "order": 49,
    "tags": [
      "финансы"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8c392bf00032b8b10c7dc",
    "title": "Создать таблицу с финансами для учета",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T13:52:18.000+0000",
    "order": 51,
    "tags": [
      "финансы"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8c39ebf00032b8b10c7ea",
    "title": "Создать общий счет",
    "completed": false,
    "bracketColor": "finance",
    "category": "Финансы",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T13:52:30.000+0000",
    "order": 53,
    "tags": [
      "финансы"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8cb9bbf00032b8b10c906",
    "title": "Затирка на балконе",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:26:35.000+0000",
    "order": 55,
    "tags": [
      "балкон"
    ]
  },
  {
    "id": "6ad8cb93bf00032b8b10c8f7",
    "title": "Разобрать коробки на балконе",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:26:27.000+0000",
    "order": 57,
    "tags": [
      "балкон"
    ]
  },
  {
    "id": "6ad8cba9bf00032b8b10c914",
    "title": "Помыть окно",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:26:49.000+0000",
    "order": 59,
    "tags": [
      "комната"
    ],
    "parentId": "6ade485ae9a77a0000000712"
  },
  {
    "id": "6ade485ae9a77a0000000712",
    "title": "комната",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-25T18:20:10.000+0000",
    "order": 61,
    "tags": [
      "комната"
    ],
    "isHub": true,
    "subtaskCount": 7
  },
  {
    "id": "6ad8cbf3bf00032b8b10c974",
    "title": "Сложить вещи в шкафу",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:28:03.000+0000",
    "order": 63,
    "tags": [
      "комната"
    ]
  },
  {
    "id": "6ad8cbfcbf00032b8b10c982",
    "title": "Сделать плинтус",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:28:12.000+0000",
    "order": 65,
    "tags": [
      "комната"
    ],
    "parentId": "6ade485ae9a77a0000000712"
  },
  {
    "id": "6ad8cc19bf00032b8b10c99e",
    "title": "Решить вопрос с заглушкой над кухонням шкафом",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:28:41.000+0000",
    "order": 67,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cc2dbf00032b8b10c9ac",
    "title": "Заменить лампочку в люстре",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:29:01.000+0000",
    "order": 69,
    "tags": [
      "комната"
    ],
    "parentId": "6ade485ae9a77a0000000712"
  },
  {
    "id": "6ad8cc8fbf00032b8b10c9f7",
    "title": "Перестановка?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Все",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:30:39.000+0000",
    "order": 71,
    "tags": [
      "дом"
    ],
    "parentId": "6ade4860e9a77a0000000716"
  },
  {
    "id": "6ad8cc93bf00032b8b10ca05",
    "title": "Отпарить шторы",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:30:43.000+0000",
    "order": 73,
    "tags": [
      "комната"
    ]
  },
  {
    "id": "6ad8cc98bf00032b8b10ca13",
    "title": "Шкаф - белые заглушки",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:30:48.000+0000",
    "order": 75,
    "tags": [
      "комната"
    ],
    "parentId": "6ade485ae9a77a0000000712"
  },
  {
    "id": "6ad8ccb6bf00032b8b10ca2f",
    "title": "Вторая разделочная доска",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:31:18.000+0000",
    "order": 77,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cd29bf00032b8b10cab2",
    "title": "Отмыть раковину",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:33:13.000+0000",
    "order": 79,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cd98bf00032b8b10cb19",
    "title": "Терку купить",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:35:04.000+0000",
    "order": 81,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cd9dbf00032b8b10cb27",
    "title": "Открывашку купить",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:35:09.000+0000",
    "order": 83,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cda3bf00032b8b10cb35",
    "title": "Подумать что с фильтром",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:35:15.000+0000",
    "order": 85,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cdd9bf00032b8b10cb5f",
    "title": "Скатерть?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:36:09.000+0000",
    "order": 87,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cdeabf00032b8b10cb6d",
    "title": "Подставка под ложки?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:36:26.000+0000",
    "order": 89,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cdf2bf00032b8b10cb7b",
    "title": "Сушилка для посуды?",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:36:34.000+0000",
    "order": 91,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ad8cdfbbf00032b8b10cb88",
    "title": "Корзина для белья",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:36:43.000+0000",
    "order": 93,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ad8ce05bf00032b8b10cb97",
    "title": "Подушка мне",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Комната",
    "assignee": "egor",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:36:53.000+0000",
    "order": 95,
    "tags": [
      "комната"
    ],
    "parentId": "6ade485ae9a77a0000000712"
  },
  {
    "id": "6ad8ce42bf00032b8b10cbc1",
    "title": "Сковорода поменьше",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-21T14:37:54.000+0000",
    "order": 97,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac657e03f3092eba2b02ae8",
    "title": "Салатник/ под тесто",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:32:00.000+0000",
    "order": 99,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac657fd3f3092eba2b02b17",
    "title": "Бумага туалетная",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:32:29.000+0000",
    "order": 101,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "6ac658823f3092eba2b02b92",
    "title": "Заварник (в посылке + купить?)",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:34:42.000+0000",
    "order": 103,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac658f23f3092eba2b02bf9",
    "title": "Затирка на балконе",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Балкон",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:36:34.000+0000",
    "order": 105,
    "tags": [
      "балкон"
    ],
    "parentId": "6ade4847e9a77a0000000708"
  },
  {
    "id": "6ac658fb3f3092eba2b02c07",
    "title": "Постелить под водой",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Кухня",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-07T14:36:43.000+0000",
    "order": 107,
    "tags": [
      "кухня"
    ],
    "parentId": "6ade4853e9a77a000000070e"
  },
  {
    "id": "6ac8fc75fb74857a1031feb9",
    "title": "Коврик в ванную",
    "completed": false,
    "bracketColor": "neutral",
    "category": "Дом",
    "room": "Ванная",
    "assignee": "together",
    "date": "inbox",
    "projectName": "📦Для дома!",
    "createdAt": "2026-10-09T14:38:45.000+0000",
    "order": 109,
    "tags": [
      "ванная"
    ],
    "parentId": "6ade4840e9a77a0000000701"
  },
  {
    "id": "tt-diaskin-2026",
    "title": "диаскин",
    "completed": false,
    "bracketColor": "active",
    "category": "Общее",
    "room": "Все",
    "assignee": "together",
    "date": "2026-12-04",
    "projectName": "📦Для дома!",
    "createdAt": "2026-11-02T15:00:00.000+0000",
    "order": 99
  }
];

export const initialWishlist: WishlistItem[] = [
  {
    "id": "wish-6ac657b23f3092eba2b02aa2",
    "title": "Тарелки плоские?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:31:14.000+0000"
  },
  {
    "id": "wish-6ac657b83f3092eba2b02ab0",
    "title": "Тарелки глубокие?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:31:20.000+0000"
  },
  {
    "id": "wish-6ac657be3f3092eba2b02abe",
    "title": "Нож еще надо?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:31:26.000+0000"
  },
  {
    "id": "wish-6ac657ec3f3092eba2b02af6",
    "title": "Поварешки, лопатка?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:32:12.000+0000"
  },
  {
    "id": "wish-6ac6587d3f3092eba2b02b82",
    "title": "Стаканы?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:34:37.000+0000"
  },
  {
    "id": "wish-6ad8d043bf00032b8b10cc14",
    "title": "Что делаем 4 ноября?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-21T14:46:27.000+0000"
  },
  {
    "id": "wish-6ad8cc8fbf00032b8b10c9f7",
    "title": "Перестановка?",
    "category": "Комната",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-21T14:30:39.000+0000"
  },
  {
    "id": "wish-6ad8cdd9bf00032b8b10cb5f",
    "title": "Скатерть?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-21T14:36:09.000+0000"
  },
  {
    "id": "wish-6ad8cdeabf00032b8b10cb6d",
    "title": "Подставка под ложки?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-21T14:36:26.000+0000"
  },
  {
    "id": "wish-6ad8cdf2bf00032b8b10cb7b",
    "title": "Сушилка для посуды?",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-21T14:36:34.000+0000"
  },
  {
    "id": "wish-6ac658823f3092eba2b02b92",
    "title": "Заварник (в посылке + купить?)",
    "category": "Кухня",
    "estimatedPrice": 0,
    "link": "",
    "notes": "Автоматически подтянуто из TickTick",
    "egorVote": null,
    "anyaVote": null,
    "status": "pending",
    "addedBy": "together",
    "createdAt": "2026-10-07T14:34:42.000+0000"
  }
];

// Clean zero balance: user will enter manual balance when ready
export const initialBudget: JointBudget = {
  totalTarget: 80000,
  egorContribution: 0,
  anyaContribution: 0,
  currentBalance: 0,
  depositDates: '10 и 25 числа каждого месяца',
  lastUpdated: '2026-11-02T15:00:00Z'
};

export const initialTransactions: FinanceTransaction[] = [];

// Exact 5 Banks for Egor and Anya (Apple Pay 2026 specs)
export const initialCashbackCards: CashbackCard[] = [
  {
    id: 'cb-sber',
    bankName: 'Сбер',
    bankColor: '#22c55e',
    user: 'anya',
    activeMonth: 'Ноябрь 2026',
    claimed: true,
    claimDeadline: 'Выбран',
    specialFeature: 'Бонусы СберСпасибо · Аня',
    digits: '7714',
    gradientPreset: 'emerald',
    cardHolder: 'ANYA',
    categories: [
      { category: 'ВкусВилл & Супермаркеты', percent: 5 },
      { category: 'Аптеки', percent: 4 },
      { category: 'Транспорт', percent: 3 },
      { category: '0.5% Спасибо на всё', percent: 0.5 },
    ]
  },
  {
    id: 'cb-tbank',
    bankName: 'Т-Банк',
    bankColor: '#f59e0b',
    user: 'joint',
    activeMonth: 'Ноябрь 2026',
    claimed: true,
    claimDeadline: 'Выбран',
    specialFeature: 'Совместный счет пары',
    digits: '5529',
    gradientPreset: 'titanium',
    cardHolder: 'EGOR & ANYA',
    categories: [
      { category: 'Дом и ремонт', percent: 6 },
      { category: 'Рестораны и доставка', percent: 5 },
      { category: 'Аптеки', percent: 5 },
      { category: '1% на все покупки', percent: 1 },
    ]
  },
  {
    id: 'cb-wb',
    bankName: 'WB Банк',
    bankColor: '#d946ef',
    user: 'egor',
    activeMonth: 'Ноябрь 2026',
    claimed: true,
    claimDeadline: 'Выбран',
    specialFeature: 'WB Кошелек & Скидки',
    digits: '8831',
    gradientPreset: 'violet',
    cardHolder: 'EGOR',
    categories: [
      { category: 'Wildberries (WB Кошелек)', percent: 5 },
      { category: 'Одежда и обувь', percent: 3 },
      { category: 'Супермаркеты', percent: 2 },
    ]
  },
  {
    id: 'cb-alfa',
    bankName: 'Альфа-Банк',
    bankColor: '#ef4444',
    user: 'egor',
    activeMonth: 'Ноябрь 2026',
    claimed: true,
    claimDeadline: 'Выбран',
    specialFeature: 'Альфа-Карта · Егор',
    digits: '1409',
    gradientPreset: 'ruby',
    cardHolder: 'EGOR',
    categories: [
      { category: 'Супермаркеты', percent: 5 },
      { category: 'Кафе и рестораны', percent: 5 },
      { category: 'Дом и ремонт', percent: 5 },
      { category: '1% на все', percent: 1 },
    ]
  },
  {
    id: 'cb-gpb',
    bankName: 'Газпромбанк',
    bankColor: '#3b82f6',
    user: 'egor',
    activeMonth: 'Ноябрь 2026',
    claimed: true,
    claimDeadline: 'Выбран',
    specialFeature: 'Акция месяца · Егор',
    actionRequired: 'До 25 числа нажать «Забрать» в приложении',
    digits: '9276',
    gradientPreset: 'sapphire',
    cardHolder: 'EGOR',
    categories: [
      { category: 'Акция месяца (компенсация)', percent: 25 },
      { category: 'АЗС & Топливо', percent: 5 },
      { category: 'Такси & Каршеринг', percent: 5 },
    ]
  },
];

// Generate realistic weekly GCal events starting around current date
const generateInitialGcalEvents = (): GCalEvent[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getIsoDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toLocaleDateString('sv-SE');
  };

  return [
    {
      id: 'gcal-1',
      summary: 'Созвон с амбассадорами «Я-Профи» (ДФО)',
      start: { dateTime: `${getIsoDate(1)}T17:00:00+03:00`, date: getIsoDate(1) },
      end: { dateTime: `${getIsoDate(1)}T18:00:00+03:00`, date: getIsoDate(1) },
      timeStr: '17:00–18:00'
    },
    {
      id: 'gcal-2',
      summary: 'Свидание пары: ужин & прогулка',
      start: { dateTime: `${getIsoDate(2)}T19:30:00+03:00`, date: getIsoDate(2) },
      end: { dateTime: `${getIsoDate(2)}T21:30:00+03:00`, date: getIsoDate(2) },
      timeStr: '19:30'
    },
    {
      id: 'gcal-3',
      summary: 'НИУ ВШЭ: Семинар по НИР (Магистратура)',
      start: { dateTime: `${getIsoDate(3)}T15:00:00+03:00`, date: getIsoDate(3) },
      end: { dateTime: `${getIsoDate(3)}T16:30:00+03:00`, date: getIsoDate(3) },
      timeStr: '15:00–16:30'
    },
    {
      id: 'gcal-4',
      summary: 'Синхронизация по деплою OpenMap',
      start: { dateTime: `${getIsoDate(4)}T18:00:00+03:00`, date: getIsoDate(4) },
      end: { dateTime: `${getIsoDate(4)}T18:45:00+03:00`, date: getIsoDate(4) },
      timeStr: '18:00'
    },
    {
      id: 'gcal-5',
      summary: 'Леруа Мерлен: закупка для дома (полка, герметик)',
      start: { dateTime: `${getIsoDate(5)}T13:00:00+03:00`, date: getIsoDate(5) },
      end: { dateTime: `${getIsoDate(5)}T15:00:00+03:00`, date: getIsoDate(5) },
      timeStr: '13:00'
    },
    {
      id: 'gcal-6',
      summary: 'РУДН: Лекции и тестирование онлайн',
      start: { dateTime: `${getIsoDate(6)}T12:00:00+03:00`, date: getIsoDate(6) },
      end: { dateTime: `${getIsoDate(6)}T14:00:00+03:00`, date: getIsoDate(6) },
      timeStr: '12:00–14:00'
    }
  ];
};

export const initialGcalEvents: GCalEvent[] = [];

export const initialUtilityBills: UtilityBill[] = [
  {
    id: 'util-domiland',
    serviceName: 'Домиленд: вода гор, хол; отопление',
    provider: 'УК Домиленд',
    amount: 1685.41,
    commission: 16.69,
    dueDate: '2026-11-10',
    periodText: 'Октябрь 2026',
    status: 'due',
    readingsRequired: true,
    readingsWindow: '18–25 число',
    currentReadings: {
      hotWater: 0,
      coldWater: 0
    },
    linkUrl: 'https://domiland.ru',
    history: []
  },
  {
    id: 'util-mosenergo',
    serviceName: 'Мосэнергосбыт: электричество (ПОКАЗАНИЯ)',
    provider: 'АО «Мосэнергосбыт»',
    amount: 0,
    commission: 0,
    dueDate: '2026-11-15',
    periodText: 'Октябрь 2026',
    status: 'due',
    readingsRequired: true,
    readingsWindow: '15–26 число каждого месяца',
    currentReadings: {
      electricity: 0
    },
    linkUrl: 'https://my.mosenergosbyt.ru',
    history: []
  },
  {
    id: 'util-epd',
    serviceName: 'ЕПД mos.ru: кап.ремонт, ТКО',
    provider: 'mos.ru',
    amount: 0,
    commission: 0,
    dueDate: '2026-11-10',
    periodText: 'Сентябрь-Октябрь 2026',
    status: 'paid',
    readingsRequired: false,
    linkUrl: 'https://www.mos.ru/pgu/ru/services/link/2166/',
    history: []
  },
  {
    id: 'util-wifi',
    serviceName: 'ЛК Wi-Fi (lk.formula-start.ru)',
    provider: 'Formula Start',
    amount: 740.00,
    commission: 0,
    dueDate: '2026-11-05',
    periodText: 'Октябрь 2026',
    status: 'paid',
    readingsRequired: false,
    linkUrl: 'http://lk.formula-start.ru',
    history: []
  }
];

export const initialStudyWorkItems: StudyWorkItem[] = [
  {
    id: 'sw-1',
    space: 'rudn-anya',
    user: 'anya',
    title: 'РУДН: лекции и семинары онлайн',
    description: 'Учебные модули и аттестация',
    courseOrProject: 'РУДН Онлайн',
    status: 'in_progress',
    priority: 'high',
    deadline: '2026-11-10',
    tags: ['рудн', 'учеба']
  },
  {
    id: 'sw-2',
    space: 'yaprofi-dfo',
    user: 'anya',
    title: '«Я-Профессионал» координация ДФО',
    description: 'Связь с амбассадорами и вузами Дальнего Востока',
    courseOrProject: 'Я-Профи ДФО',
    status: 'in_progress',
    priority: 'high',
    deadline: '2026-11-04',
    timezoneNote: 'Владивосток/Хабаровск (+7ч)',
    tags: ['дфо', 'владивосток', 'я-профи']
  },
  {
    id: 'sw-3',
    space: 'hse-egor',
    user: 'egor',
    title: 'ВШЭ: Магистратура',
    description: 'НИР и исследовательские проекты',
    courseOrProject: 'НИУ ВШЭ',
    status: 'in_progress',
    priority: 'high',
    deadline: '2026-11-06',
    tags: ['вшэ', 'магистратура']
  }
];
