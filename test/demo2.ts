type Context = {
    pos: number;
    buffer: ArrayBuffer;
    view: DataView;
    seek: (pos: number) => void;
}

const readLogic = [
    /* seek */ (ctx: Context, scope: {}, next: () => number) => {
        const pos = ctx.pos; // record position before read;
        const seek = 0; // some position from fieldConfig
        ctx.seek(seek); // seek to config position
        const value = next();
        ctx.seek(pos); // back to origin position
        return value;
    },
    /* condition */ (ctx: Context, scope: {}, next: () => number) => {
        const judge = true; // some condition result from fieldConfig
        const defaultValue = 0; // some default value from fieldConfig
        if (!judge) return defaultValue;
        return next();
    },
    /* loop1 */ (ctx: Context, scope: {}, next: () => number) => {
        const count = 1; // some condition result from fieldConfig
        const items = [];
        for (let i = 0; i < count; i ++) {
            items.push(next())
        }
        return items;
    },
    /* Int8 */ (ctx: Context, scope: {}, next: () => void) => {
        const value = ctx.view.getInt8(0);
        ctx.pos += 1;
        return value;
    },
];

function executeReadLogic(ctx: Context, scope: any, logic: Function[], startIndex: number = 0): any {
    if (startIndex >= logic.length) {
        // 已经执行完所有操作
        return null;
    }

    const currentOperation = logic[startIndex];
    const result = currentOperation(ctx, scope, () => {
        // 递归执行下一个操作
        return executeReadLogic(ctx, scope, logic, startIndex + 1);
    });

    return result;
}

function freezeReadLogic(ctx: Context, scope: any) {
    const xxx = readLogic.reverse();
    xxx.reduce((prev, cur) => cur.bind(void 0, ctx, scope))
}
