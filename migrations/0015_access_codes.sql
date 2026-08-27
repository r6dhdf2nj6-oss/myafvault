-- One-time lifetime access codes. Only SHA-256 hex hashes are stored.
create table if not exists access_codes (
  code_hash text primary key,
  redeemed_by text references "user" ("id"),
  redeemed_at timestamptz
);

create unique index if not exists access_codes_redeemed_by_key
  on access_codes (redeemed_by)
  where redeemed_by is not null;

insert into access_codes (code_hash) values
('6b33db2f931c8b6fe40a750fb9350b1638bf6648cbb02b7c1e853e48af0cfee4'),
('b199cc1aa84607a806cf952a24815ed49c2baf632832f35424caff0295f9087a'),
('c3171b98940e2cf784856dccf4680849dcbe898f4fae73ded1a2ceff0adc3a7c'),
('cf5e1e25951d1bf9080f4d6f0dea88d3f565597e3f6f2e755062dfc936ceda0b'),
('cb15b9419478c3b22bdf0e090ca2cf07abad17bfe42cdef9def2742ced7deffe'),
('a98da51654f0ddb8a9a4d7c1c4c649dd5e4c7766fa722e6d56f50c72ed1834c9'),
('96c5ebe359cd64339488571c76e0f79062ddcb5256bb371f1b49563b95c2a206'),
('cad1d2b6cdee3d35193feba3a3201978eacaf6124f9654a16d1eabf1c355c529'),
('9444722fe8d7ec4ed6ad31bf9393384fa90a8fc59f0b27a253d84a76287cfddc'),
('fef6684270b8eb542a9388efe085a79fbb6eda09aa1ca86a0db5d460bfcf84db');
