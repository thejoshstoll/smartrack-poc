import Definition from './Rack.json'
const Rack = {}

Definition.abi.forEach(method => {
    if (!method.name || method.type !== 'function'){
        return
    }

    Rack[method.name] = method;
})

export default Rack