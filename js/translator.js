export default class Translator {
    constructor() {
        this.init();
    }

    init() {
        this.lang = languages[0];
        for (const language of languages) {
            if (navigator.languages.includes(language)) {
                this.lang = language;
                break;
            }
        }
    }

    translate(code) {
        return translations[this.lang][code] || translations[this.lang]['error.unknown'];
    }
}

const languages = ['ru', 'en'];

const translations = {
    ru: {
        'error.network': 'Ошибка сети. Проверьте подключение',
        'error.unknown': 'Неизвестная ошибка',
        'error.message_send': 'Не удалось отправить сообщение',
    },
    en: {
        'error.network': 'Network error',
        'error.unknown': 'Unknown error',
        'error.message_send': 'Can\'t send message',
    }
};

