
import moment from 'moment';

const today = () => {
    const t = new Date(moment());
    let tYear = t.getFullYear();
    let tMonth = t.getMonth();
    let tDay = t.getDate();
    return { tYear, tMonth, tDay };
};

export default today;