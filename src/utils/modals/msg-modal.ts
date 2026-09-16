import { reactive } from 'vue';


export const msgModal = reactive({
    // État
    isOpen: false,
    title: '',
    message: '',
    buttonLabel1: null,
    onclick1: null,
    buttonLabel2: null,
    onclick2: null,
    danger: false,
    button2Color: null,
    isButton1Disabled: false,

    // Actions pour modifier l'état
    show(title , message, buttonLabel1, onclick1, buttonLabel2, onclick2, danger, button2Color) {
        this.title = title;
        this.message = message;
        this.isOpen = true;
        this.buttonLabel1 = buttonLabel1
        this.onclick1 = onclick1
        this.buttonLabel2 = buttonLabel2
        this.onclick2 = onclick2
        this.danger = danger
        this.button2Color = button2Color
    },

    updateMsg(message)
    {
        this.message = message;
    },

    activateButton1()
    {
        this.isButton1Disabled = false
    },

    deactivateButton1()
    {
        this.isButton1Disabled = true
    },

    defaultClose() {

        this.title = '';
        this.message = '';
        this.isOpen = false;
        this.onclick1 = null;
        this.onclick2 = null;
        this.buttonLabel1 = null
        this.buttonLabel2 = null
        this.danger = false
        this.isButton1Disabled = false
    }

});