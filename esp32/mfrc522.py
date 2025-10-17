from machine import Pin, SPI
import time

class MFRC522:
    OK = 0
    NOTAGERR = 1
    ERR = 2

    REQIDL = 0x26
    REQALL = 0x52
    AUTHENT1A = 0x60
    AUTHENT1B = 0x61
    PICC_SElECTTAG = 0x93
    PICC_READ = 0x30
    PICC_WRITE = 0xA0
    PICC_HALT = 0x50

    def __init__(self, spi, cs, rst):
        self.spi = spi
        self.cs = cs
        self.rst = rst

        self.cs.init(Pin.OUT, value=1)
        self.rst.init(Pin.OUT, value=1)

        self.reset()
        self.write_reg(0x2A, 0x8D)
        self.write_reg(0x2B, 0x3E)
        self.write_reg(0x2D, 30)
        self.write_reg(0x2C, 0)
        self.write_reg(0x15, 0x40)
        self.antenna_on()

    def reset(self):
        self.write_reg(0x01, 0x0F)

    def write_reg(self, addr, val):
        self.cs.value(0)
        self.spi.write(bytearray([(addr << 1) & 0x7E, val]))
        self.cs.value(1)

    def read_reg(self, addr):
        self.cs.value(0)
        self.spi.write(bytearray([((addr << 1) & 0x7E) | 0x80]))
        val = self.spi.read(1)
        self.cs.value(1)
        return val[0]

    def set_bitmask(self, reg, mask):
        tmp = self.read_reg(reg)
        self.write_reg(reg, tmp | mask)

    def clear_bitmask(self, reg, mask):
        tmp = self.read_reg(reg)
        self.write_reg(reg, tmp & (~mask))

    def antenna_on(self):
        temp = self.read_reg(0x14)
        if ~(temp & 0x03):
            self.set_bitmask(0x14, 0x03)

    def to_card(self, cmd, send):
        recv = []
        bits = irq_en = wait_irq = n = 0

        if cmd == 0x0E:
            irq_en = 0x12
            wait_irq = 0x10
        elif cmd == 0x0C:
            irq_en = 0x77
            wait_irq = 0x30

        self.write_reg(0x02, irq_en | 0x80)
        self.clear_bitmask(0x04, 0x80)
        self.set_bitmask(0x0A, 0x80)
        self.write_reg(0x01, 0x00)

        for c in send:
            self.write_reg(0x09, c)
        self.write_reg(0x01, cmd)

        if cmd == 0x0C:
            self.set_bitmask(0x0D, 0x80)

        i = 2000
        while True:
            n = self.read_reg(0x04)
            i -= 1
            if ~((i != 0) and not (n & 0x01) and not (n & wait_irq)):
                break

        self.clear_bitmask(0x0D, 0x80)

        if i != 0:
            if (self.read_reg(0x06) & 0x1B) == 0x00:
                status = self.OK
                if n & irq_en & 0x01:
                    status = self.NOTAGERR
                if cmd == 0x0C:
                    n = self.read_reg(0x0A)
                    last_bits = self.read_reg(0x0C) & 0x07
                    if last_bits != 0:
                        bits = (n - 1) * 8 + last_bits
                    else:
                        bits = n * 8
                    if n == 0:
                        n = 1
                    if n > 16:
                        n = 16
                    for _ in range(n):
                        recv.append(self.read_reg(0x09))
            else:
                status = self.ERR
        else:
            status = self.ERR
        return status, recv, bits

    def request(self, req_mode):
        self.write_reg(0x0D, 0x07)
        status, recv, bits = self.to_card(0x0C, [req_mode])
        if (status != self.OK) | (bits != 0x10):
            status = self.ERR
        return status, bits

    def anticoll(self):
        ser_chk = 0
        ser = []
        self.write_reg(0x0D, 0x00)
        status, recv, bits = self.to_card(0x0C, [self.PICC_SElECTTAG, 0x20])
        if status == self.OK:
            if len(recv) == 5:
                for i in range(4):
                    ser_chk ^= recv[i]
                if ser_chk != recv[4]:
                    status = self.ERR
            else:
                status = self.ERR
        return status, recv

