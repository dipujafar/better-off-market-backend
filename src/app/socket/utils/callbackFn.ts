const callbackFn = (callback: (arg: unknown) => void, data: unknown) => {
    if (typeof callback === 'function') {
        callback(data);
    }
};

export default callbackFn;