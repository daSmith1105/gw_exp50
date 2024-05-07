import moment from 'moment';

const sevenDaysAgo = () => {
    const s = new Date(moment().subtract(7, 'days'));
    let sdaYear = s.getFullYear();
    let sdaMonth = s.getMonth();
    let sdaDay = s.getDate();
    return { sdaYear, sdaMonth, sdaDay };
};

export default sevenDaysAgo;