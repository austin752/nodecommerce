const deleteProduct = btn =>{
    const prodId = btn.parentNode.querySelector('[name=prodId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const prodEle = btn.closest('article');

    fetch('/admin/products/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result =>{
            console.log(result);
            return result.json();
        })
        .then(data =>{
            console.log(data);
            prodEle.parentNode.removeChild(prodEle);
        })
        .catch(err =>{
            console.log(err);
        });
};