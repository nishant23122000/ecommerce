const deleteProduct=(btn)=>{
    const productId=btn.parentNode.querySelector('[name=productId]').value
    const csrfToken=btn.parentNode.querySelector('[name=_csrf]').value
    const productElement=document.querySelector('.card')
    console.log(productElement)
    fetch('/admin/product/'+productId,{
        method:'DELETE',
        headers:{
            'csrf-token':csrfToken
        }
    }).then((result)=>{
        console.log(result)
        return result.json()
    }).then((data)=>{
        console.log(data)
        productElement.remove()
    }).catch((error)=>{
        console.log(error)
    })
}