
import Definition from './Main.json'
const Contract = {}
Contract.address = Definition.networks["5777"].address

Definition.abi.forEach(method => {
    if (!method.name || method.type !== 'function'){
        return
    }

    Contract[method.name] = method;
})

export default Contract