import { Property } from './'
import { Serializer } from '..';
import { SerializationError } from '../PropertyErrors';

export class IntProperty extends Property {
    constructor() {
        super();
        this.Property = 0;
        this.Index = 0;
    }
    get Size() {
        return this.Name.length + 4
            + this.Type.length + 4
            + 13;
    }
    deserialize(serial) {
        this.Index = serial.readInt32();
        serial.seek(1);
        this.Property = serial.readInt32();
        return this;
    }
    serialize() {
        let serial = Serializer.alloc(this.Size);
        serial.writeString(this.Name);
        serial.writeString(this.Type);
        serial.writeInt32(4);
        serial.writeInt32(this.Index);
        serial.seek(1);
        serial.writeInt32(this.Property);
        if (serial.tell !== this.Size)
            throw new SerializationError(this);
        return serial.Data;
    }
    static from(obj) {
        let prop = new IntProperty();
        Object.assign(prop, obj);
        return prop;
    }
}
