const data = {
    position: {x: 0, y: 0},
    tempPosition: {x: 0, y: 0},
    enabled: false,
    options: [],
}

export default {
    reset: () => {
        data.enabled = false
        data.options = []
    },
    toggle: (options: Array<{text: string, callback: any}>) => {
        const opt: any = options
        data.options = opt
        data.enabled = true//!data.enabled
        data.position = data.tempPosition
    },
    data: data
}