let rightAns = document.querySelectorAll('.correct');
const radioBtns = document.querySelectorAll('.inputBtns');
// const arr = [];

rightAns.forEach(el=> {
    el.style.backgroundColor = 'green';
    el.style.borderRadius = '5px';
    el.style.padding = '3px';
    // arr.push(el);
})

// rightAns = arr;

radioBtns.forEach(element => {
    // if (!rightAns.includes(element)) {
        element.style.display = 'none'
    // }
});



