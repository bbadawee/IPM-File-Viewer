Banking Production Center
SmartVista Back Office
1
SMARTVISTA BACK OFFICE
SmartVista Clearing File Format
Version 1.10
Banking Production Center
SmartVista Back Office
2
Table of contents
CLEARING FILE STRUCTURE....................................................................................................3
ANNOTATION OF DATA ELEMENT ATTRIBUTES ...............................................................4
CONVENTIONS FOR DATA REPRESENTATION....................................................................5
MESSAGE TYPES AND ASSOCIATED FUNCTION CODES ..................................................6
FILE HEADER AND TRAILER .....................................................................................................7
FINANCIAL MESSAGES ................................................................................................................8
FILE REJECT..................................................................................................................................11
MESSAGE EXCEPTION ...............................................................................................................12
DATA ELEMENT DEFINITIONS................................................................................................13
DE22 POS DATA CODE...................................................................................................................13
PDS1002 TRANSACTION TYPES ......................................................................................................16
DE55 INTEGRATED CIRCUIT CARD (ICC) SYSTEM-RELATED DATA...............................................17
Mandatory and Conditional Subelements..................................................................................17
Optional Subelements ................................................................................................................18
DE38 APPROVAL CODE ..................................................................................................................19
DATA INTEGRITY CHECK PRINCIPLES................................................................................20
REVISION HISTORY ....................................................................................................................21
Banking Production Center
SmartVista Back Office
3
Clearing file structure
Banking Production Center
SmartVista Back Office
4
Annotation of Data Element Attributes
The following notation conventions are employed throughout this manual to describe the attributes
of all data elements.
Table 1. Data Representation Attributes
Notation Description
a alphabetic characters A–Z and a–z
n numeric digits 0–9
as alphabetic characters (A–Z and a–z), and space character
ns numeric digits 0–9 and special characters (including space)
an alphabetic (A–Z and a–z) and numeric characters
ans alphabetic (A–Z and a–z), numeric, and special characters (including
space)
b binary representation of data in eight-bit bytes
Table 2. Date and Time Attributes
Notation Description
MM month (two digits; 01–12)
DD day (two digits; 01–31)
YY year (last two digits of calendar year; 00–99)
hh hour (two digits; 00–23)
mm minute (two digits; 00–59)
ss second (two digits; 00–59)
Table 3. Data Length Attributes
Notation Description
-digit(s) Fixed length in number of positions.
Example: “n-3” indicates a three-position numeric data element.
Example: “an-10” indicates a 10-position alphanumeric data element.
...digit(s) Variable length, with maximum number of positions specified.
Example: “n...11” indicates a variable-length numeric data element of 1–11 digits.
Example: “an...25” indicates a variable-length alphanumeric data element of 1 to 25
positions.
LLVAR Present with a variable-length data element attribute, indicates that the data element
contains two fields:
“LL” is the length field and represents the number of positions in the variable-length
data field that follows. The length field contains a value in the range 01–99.
“VAR” is the variable-length data field.
Example: “an…25; LLVAR” represents a variable-length alphanumeric data element
with a length of 1 to 25 positions.
LLLVAR Present with a variable-length data element attribute, indicates that the data element
contains two fields:
“LLL” is the length field and represents the number of positions in the variable-length
data field that follows. The length field contains a value in the range 001–999.
“VAR” is the variable-length data field.
Example: “an…500; LLLVAR” indicates a variable-length alphanumeric data element
having a length of 1 to 500 positions.
Banking Production Center
SmartVista Back Office
5
Conventions for Data Representation
This specification is independent of the specific data-encoding format (EBCDIC).
The following data encoding conventions are standard for all messages.
• All message data elements are aligned on byte boundaries; for example, a data element cannot begin with the low order “nibble” or any bit other than the high order bit of any byte.
• All binary (attribute b) data elements are constructed of bit-strings that have lengths that are
an integral number of eight-bit bytes. No binary data element has a length of less than eight
bits (one byte).
• All track 2 or track 3 (attribute ans) data elements are encoded as EBCDIC representations
of the hexadecimal data specified in the ISO 7811 and 7812 specifications. Thus, a hexadecimal D (binary 1101) is encoded as an EBCDIC D character, and so forth. The LL or LLL
length specification associated with these data elements specifies the data element length in
number of bytes.
• All length fields are encoded as numeric, right-justified with leading ZEROS:
i) Data elements with LL attributes have length fields with values in the range 01–99.
ii) Data elements with LLL attributes have length fields with values in the range 001–999.
In the message format layouts, the following three columns provide information to the originator,
clearing system, and destination related to the data element requirements:
• Org – Originator Requirements. The message originator must satisfy this data element's requirements before sending the message;
• SV – SV Clearing System Requirements. The clearing system may insert, correct, or modify
this data element while, for example, routing a message from the origin to the destination.
The clearing system may overwrite the data element and thereby overwrite any previous
content;
• Dst – Destination Requirements. The message destination must expect this data element
(read it) and accept this data element (process it) if the originator requirements are satisfied.
The following notations describe the requirements for each data element. Notations appear in the
Org, SV, and Dst columns:
• M – Mandatory. The data element is required in the message;
• C – Conditional. The data element is required in the message if the conditions described in
the accompanying text are applicable;
• O – Optional. The data element is not required but may be included in the message at the
message originator's option;
• X – SV System. The SV may (or will) insert or overwrite the data element;
• N/A – Not Required or Not Applicable. The data element is not required or not applicable,
and the transaction originator should not include it if this symbol is present in the "Org" column.
Banking Production Center
SmartVista Back Office
6
Message Types and Associated Function Codes
Message Type Identifier (MTI) Function Code (DE24) Description
1644 697 File Header
695 File Trailer
699 File Reject
691 Message Exception
1240 200 First Presentment
205 Second Presentment (Full)
282 Second Presentment (Partial)
1442 450 First Chargeback (Full)
451 Arbitration Chargeback (Full)
453 First Chargeback (Partial)
454 Arbitration Chargeback (Partial)
Banking Production Center
SmartVista Back Office
7
File Header and Trailer
Table 4. File Header and Trailer messages, MTI 1644
Data
element
PDS Subfields Name Description Attribute File Header File Trailer
Org SV Dst Org SV Dst
- Message Type Identifier (MTI) “1644” n-4 M X M M X M
- Bit Map, Primary
Bit Map, Primary is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 1 (Bit Map, Secondary) through DE 64 (Message Authentication Code [MAC]) in the message b-8
M X M M X M
1 Bit Map, Secondary
DE 1 (Bit Map, Secondary) is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 65 (Reserved [ISO]) through DE 128
(Message Authentication Code [MAC]) in the message b-8
M X M M X M
24 Function Code
DE 24 (Function Code) indicates a message's specific purpose:
• 697 – File Header;
• 695 – File Trailer. n-3
M X M M X M
48 Additional Data
DE 48 (Additional Data) contains one or more PDSs that may be required in a message to provide additional clearing system-related, program-related, or service
data for which a specific ISO data element is unavailable LLLVAR M X M M X M
0105 File ID PDS 0105 (File ID) uniquely identifies a logical data file to be exchanged between a member and the clearing system TAG M X M M X M
Len Tag “025” LLLVAR
1 File Type
• 001 – Clearing file: Generated by SV;
• 002 – Clearing file: Member-generated n-3
2 File Reference Date (YYMMDD) For member-generated logical files, subfield 2 (File Reference Date) is the date that the transmitting member processed or submitted the file n-6
3 Network Member ID
For member-generated logical files, subfield 3 contains the member ID of the member submitting the file (Member ID granted by Processor)
For SV-generated logical files, subfield 3 contains the member ID of the Processor (SV) n-11
4 File Sequence Number
Subfield 4 (File Sequence Number) is a five-digit value that the member submitting the file assigns. It must be unique for each Member ID and File Reference Date
combination n-5
0122 Processing Mode
PDS 0122 (Processing Mode) indicates the type of processing to be performed on transaction messages:
• P – Production;
• T – Test. TAG
M X M N/A N/A N/A
Len Tag “001” LLLVAR
Value ans-1
0301 File Amount, Checksum PDS 0301 (File Amount, Checksum) provides a preliminary "quick check" for the file recipient to indicate or to determine that it received all messages in a file TAG N/A N/A N/A M X C
Len Tag “016” LLLVAR
Value n-16
0306 File Message Counts PDS 0306 (File Message Counts) provides a preliminary "quick check" for the file recipient to indicate that all records in a file have been received TAG N/A N/A N/A M X M
Len Tag “008” LLLVAR
Value n-8
71 Message Number
The transaction originator assigns the DE 71 (Message Number) to data messages in a file. DE 71 monitors the integrity and continuity of the files being exchanged.
The first message in a data file (the File Header) must have the Message Number 00000001. For each subsequent message in the file (including the File Header),
this data element value must be greater than the value in the previously accepted message n-8
M X M M X M
Banking Production Center
SmartVista Back Office
8
Financial messages
Table 5. Financial messages, MTI 1240 and 1442
Data
element
PDS Subfields Name Description Attribute First Presentment,
1240
Second Presentment,
1240
First Chargeback and
Arbitration Chargeback, 1442
Org SV Dst Org SV Dst Org SV Dst
- Message Type Identifier (MTI) The Message Type Identifier (MTI) is a four-digit numeric field describing the type of message being interchanged n-4 M N/A M M N/A M M N/A M
- Bit Map, Primary Bit Map, Primary is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 1
(Bit Map, Secondary) through DE 64 (Message Authentication Code [MAC]) in the message
b-8 M X M M X M M X M
1 Bit Map, Secondary DE 1 (Bit Map, Secondary) is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0)
of DE 65 (Reserved [ISO]) through DE 128 (Message Authentication Code [MAC]) in the message
b-8 M X M M X M M X M
2 Primary Account Number (PAN) DE 2 (Primary Account Number [PAN]) is a series of digits that identify a customer account n…19;
LLVAR
M N/A M M N/A M M N/A M
3 Processing Code DE 3 (Processing Code) is a series of digits that describe the effect of a transaction on a customer account and the type
of accounts affected
n-6 M N/A M M N/A M M N/A M
1 Cardholder Transaction Type • 00 Purchase (Goods and Services)
• 01 ATM Cash Withdrawal
• 12 Cash Disbursement
• 18 Unique Transaction (requires unique MCC)
• 20 Credit (Purchase Return)
• 28 Payment Transaction
n-2
2 Cardholder “From” Account Type Code “00” n-2
3 Cardholder “To” Account Type Code “00” n-2
4 Amount, Transaction DE 4 (Amount, Transaction) is the amount of funds the cardholder requested in the currency appearing on the transaction information document
n-12 M N/A M M N/A M M N/A M
5 Amount, Reconciliation DE 5 (Amount, Reconciliation) is the DE 4 (Amount, Transaction) value converted to the member's reconciliation (that
is, the member's payment or settlement) currency
n-12 C X M N/A X M N/A X M
9 Conversion Rate, Reconciliation DE 9 (Conversion Rate, Reconciliation) is the factor used in converting transaction amount to reconciliation amount.
After adjusting for the decimal location, DE 9 is multiplied by DE 4 (Amount, Transaction) to determine DE 5
(Amount, Reconciliation).
n-8 N/A X M N/A X M N/A X M
12 Date and Time, Local Transaction DE 12 (Date and Time, Local Transaction) is the local year, month, day, and time at which the transaction takes place
at the card acceptor location
n-12 M N/A M M N/A M M N/A M
1 Date (YYMMDD) n-6
2 Time (hhmmss) n-6
14 Date, Expiration (YYMM) DE 14 (Date, Expiration) specifies the year and month after which a card expires n-4 O N/A C O N/A C O N/A C
22 Point of Service Data Code
DE 22 (Point of Service Data Code) is a series of codes that identify terminal capability, terminal environment, and
point-of-interaction (POI) security data. DE 22 indicates specific conditions that are (or were) present at the time a
transaction occurred at the point of interaction. See chapter “Data Element Definitions” for details.
an-12 M N/A M M N/A M M N/A M
1 Card data input capability Card data input capability an-1
2 Cardholder authentication capability The ability to authenticate the cardholder n-1
3 Card capture capability The ability to capture cards n-1
4 Operating environment Operating environment (POS Condition Code ) n-1
5 Cardholder presence indicator The presence of the cardholder an-1
6 Card presence The presence of the card n-1
7 Card data input mode Card data input method an-1
8 Cardholder authentication method The method of authentication of the card holder an-1
9 Cardholder authentication of the entity Authentication of the cardholder n-1
10 Card data output capability Card data output capability an-1
11 Terminal output capability Terminal output capability n-1
12 PIN capture capability PIN capture capability an-1
Banking Production Center
SmartVista Back Office
9
23 Card Sequence Number DE 23 (Card Sequence Number) distinguishes among separate cards having the same DE 2 (Primary Account Number
[PAN])
n-3 O N/A C O N/A C O N/A C
24 Function Code DE 24 (Function Code) indicates a message's specific purpose:
• 200 – First Presentment;
• 205 – Second Presentment (Full);
• 282 – Second Presentment (Partial);
• 450 – First Chargeback (Full);
• 451 – Arbitration Chargeback (Full);
• 453 – First Chargeback (Partial);
• 454 –Arbitration Chargeback (Partial).
n-3 M N/A M M N/A M M N/A M
25 Reason Code DE 25 (Message Reason Code) provides the message receiver with the reason for sending the message n-4 N/A N/A N/A M N/A M M N/A M
26 Card Acceptor Business Code (MCC) DE 26 (Card Acceptor Business Code [MCC]) classifies the type of business applicable to the card acceptor n-4 M N/A M M N/A M M N/A M
30 Original Amount DE 30 (Amounts, Original) contains the "amount" data element values from the First Presentment/1240 n-24 N/A N/A N/A M N/A M M N/A M
1 Original Amount, Transaction n-12
2 Original Amount, Reconciliation n-12
31 Acquirer Reference Data DE 31 (Acquirer Reference Data) is data an acquirer supplies in an acquirer-originated message that may be required
for an issuer to return to the acquirer in a subsequent message
n-23;
LLVAR
M N/A M M N/A M M N/A M
1 Constant “9” n-1
2 Acquirer’s BIN 6 digits n-6
3 Julian Processing Date YDDD Julian Processing Date YDDD contains the Julian processing date the acquirer assigned to the First Presentment/1240 n-4
4 Acquirer’s Sequence Number Acquirer’s Sequence Number contains the sequence number that the acquirer assigned to the First Presentment/1240 ans-11
5 Check Digit “0” n-1
32 Acquiring Institution ID Code DE 32 (Acquiring Institution ID Code) identifies a transaction acquirer n 6...11;
LLVAR
O N/A C O N/A C O N/A C
33 Forwarding Institution ID Code DE 33 (Forwarding Institution ID Code) identifies a message's forwarding institution. A forwarding institution is the
institution in a transaction flow that sends a message forward from the originating institution
n 6...11;
LLVAR
M X M M N/A M M X M
37 Retrieval Reference Number DE 37 (Retrieval Reference Number) is a transaction information document reference number the card acceptor's or
designated agent's system supplies. DE 37 retains the transaction's original source information. This reference number
assists in locating that source information (or a copy)
ans-12 C N/A C O X C O N/A C
38 Approval Code DE 38 (Approval Code) is a code the authorizing institution assigns indicating approval ans-6 C N/A C C N/A C C N/A C
41 Card Acceptor Terminal ID DE 41 (Card Acceptor Terminal ID) is a unique code identifying a terminal at the card acceptor location ans-8 C N/A C O N/A C O N/A C
42 Card Acceptor ID Code DE 42 (Card Acceptor ID Code) identifies the card acceptor ID assigned by the acquirer. This ID must represent a
unique identifier for each merchant name/location (DE 43) within the acquiring BIN (DE 31, subfield 2)
ans-15 C N/A C C N/A C C N/A C
43 Card Acceptor Name/Location DE 43 (Card Acceptor Name/Location) contains the card acceptor's name and location as known to the cardholder LLVAR M N/A M M N/A M M N/A M
1 Card Acceptor Name/Card Acceptor
Street Address/ Card Acceptor City/
ans...22
Delimiter “\” or “/” an-1
2 Card Acceptor Street Address ans...45
Delimiter “\”or “/” an-1
3 Card Acceptor City ans...13
Delimiter “\”or “/” an-1
4 Card Acceptor Postal (ZIP) Code ans-10
5 Card Acceptor State, Province, or Region
Code
ans-3
6 Card Acceptor Country Code ans-3
48 Additional Data DE 48 (Additional Data) contains one or more PDSs that may be required in a message to provide additional clearing
system-related, program-related, or service data for which a specific ISO data element is unavailable
an…999;
LLLVAR
M X M M X M M X M
0023 Terminal Type PDS0023 identifies the type of terminal used at the point of interaction. TAG M N/A M M N/A M M N/A M
Len Tag LLLVAR
Value “ATM” – ATM terminal
“POS” convert into “CT2” – POS terminal
“EPOS” convert into “CT6”- E-commerce transaction
“VOICE” convert into “MAN” – Manual (voice terminal)
“NA” – Terminal type data unknown or not available
ans...3
0025 Message Reversal Indicator PDS 0025 (Message Reversal Indicator) identifies a message as a reversal of a previous message. “R” or space. If a
message is not a reversal, members/processors should not provide PDS 0025
TAG O N/A C C X C O N/A C
Len Tag “001” LLLVAR
Banking Production Center
SmartVista Back Office
10
Value a-1
0165 Settlement indicator PDS 0165 (Settlement Indicator) indicates the settlement impact of amounts in a message: standard or collection-only
processing
M N/A M M N/A M M N/A M
Len Tag “003” LLLVAR
Value “C” - Collection Only; the transaction is On-Us or intraprocessor and was cleared and settled outside the clearing
system; it is submitted to the clearing system according to rules governing “collection-only” transactions.
“M” – SV clearing and net settlement; the clearing system should clear and settle the transaction. This value is used by
default in case PDS00165 is not provided.
ans-1
0262 PDS 0262 (Documentation Indicator) indicates whether supporting documentation will be provided for the current
chargeback. Optional, not present for first presentments
TAG N/A N/A N/A M X M M X M
Len Tag “001” LLLVAR
Value • 0 – Supporting documentation is not required;
• 1 – Supporting documentation will follow
n-1
1002 Transaction type See chapter “PDS1002 Transaction types” for details. TAG M N/A M M N/A M M N/A M
Len Tag “003” LLLVAR
Value n-3
49 Currency Code, Transaction DE 49 (Currency Code, Transaction) defines the DE 4 (Amount, Transaction) currency n-3 M N/A M M N/A M M N/A M
50 Currency Code, Reconciliation DE 50 (Currency Code, Reconciliation) defines the DE 5 (Amount, Reconciliation) currency n-3 C X M N/A X M N/A X M
55 Integrated Circuit Card (ICC) SystemRelated Data
DE 55 contains chip data formatted in accordance with the EMV chip specification, it should be provided in First
Presentment/1240 messages for all chip transactions. See chapter “Data Element Definitions” for details.
b…LLLV
AR
C N/A C O N/A C O N/A C
63 Network Transaction ID All life cycle messages such as Authorizations, Financials, Reversals and Chargebacks are linked with the Life Cycle
Support Indicator and Trace ID subfields
ans-15;
LLLVAR
C N/A C C N/A C C N/A C
71 Message Number The transaction originator assigns the DE 71 (Message Number) to data messages in a file. DE 71 monitors the integrity and continuity of the files being exchanged (2, 3, 4…)
n-8 M X M M X M M X M
72 Data Record DE 72 (Data Record) contains message text data, file update data, or other information as specified in individual IPM
messages
ans...999;
LLLVAR
N/A N/A N/A C N/A C C N/A C
93 Transaction Destination Institution ID
Code
DE 93 (Transaction Destination Institution ID Code) identifies the transaction destination institution n 6...11;
LLVAR
N/A X M N/A X M N/A X M
94 Transaction Originator Institution ID
Code
DE 94 (Transaction Originator Institution ID Code) identifies the transaction originator institution n 6...11;
LLVAR
M N/A M M N/A M M X M
100 Receiving Institution ID Code DE 100 (Receiving Institution ID Code) identifies the receiving institution n..11;
LLVAR
N/A X M N/A X M N/A X M
Banking Production Center
SmartVista Back Office
11
File Reject
Table 6. File Reject messages, MTI 1644
Data
element PDS Subfields Name Description Attribute Org SV Dst
- Message Type Identifier (MTI) “1644” n-4 N/A X M
- Bit Map, Primary
Bit Map, Primary is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 1 (Bit Map, Secondary) through DE 64 (Message Authentication Code [MAC]) in the message b-8
N/A X M
1 Bit Map, Secondary
DE 1 (Bit Map, Secondary) is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 65 (Reserved [ISO]) through DE 128 (Message
Authentication Code [MAC]) in the message b-8
N/A X M
24 Function Code
DE 24 (Function Code) indicates a message's specific purpose:
• 699 – File Reject n-3
N/A X M
48 Additional Data
DE 48 (Additional Data) contains one or more PDSs that may be required in a message to provide additional clearing system-related, program-related, or service data for which a
specific ISO data element is unavailable
an...999;
LLLVAR N/A X M
0005 Message Error Indicator
PDS 0005 (Message Error Indicator) identifies the location, severity, and general description of data element errors in a message. This PDS may contain 1–10 occurrences of
message exception data. TAG N/A X M
Len Tag 3 positions, value = 014–140 LLLVAR
1 Data Element ID
Identifies the ISO data element or PDS where the error occurred. ISO data elements are identified with the prefix C. PDSs are identified with the prefix P followed by the fourdigit tag ID. an-5
2 Error Severity Code Indicates the severity of the error the clearing system detects. n-2
3 Error Message Code It is a four-digit value that refers to a specific edit error message to identify the error condition. an-4
4 Subfield ID Holds the three-position subfield ID of the element in error. This subfield will contain zeros if the element in error is not defined with subfields. n-3
0138 Source Message Number ID PDS 0138 DE 71 (Message Number) of the message that caused the file to reject (if the clearing system can parse) TAG N/A X C
Len Tag “008” n-8; LLL
0280 Source File ID PDS 0280 (Source File ID) provides the File ID of a referenced data file. Refer to PDS 0105 in the chapter “File Header and Trailer messages” for descriptions of these subfields. TAG N/A X C
Len Tag “025” n-25; LLL
72 Data Record DE 72 (Data Record) contains message text data or other information as specified in individual IPM messages.
ans...999;
LLLVAR N/A X M
Banking Production Center
SmartVista Back Office
12
Message Exception
Table 7. Message Exception message, MTI 1644
Data
element PDS Subfields Name Description Attribute Org SV Dst
- Message Type Identifier (MTI) “1644” n-4 N/A X M
- Bit Map, Primary
Bit Map, Primary is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 1 (Bit Map, Secondary) through DE 64 (Message Authentication Code [MAC]) in the message b-8
N/A X M
1 Bit Map, Secondary
DE 1 (Bit Map, Secondary) is a series of 64 bits that identify the presence (denoted by 1) or the absence (denoted by 0) of DE 65 (Reserved [ISO]) through DE 128 (Message
Authentication Code [MAC]) in the message b-8
N/A X M
24 Function Code
DE 24 (Function Code) indicates a message's specific purpose:
• 699 – File Reject n-3
N/A X M
48 Additional Data
DE 48 (Additional Data) contains one or more PDSs that may be required in a message to provide additional clearing system-related, program-related, or service data for which a
specific ISO data element is unavailable
an...999;
LLLVAR N/A X M
0005 Message Error Indicator
PDS 0005 (Message Error Indicator) identifies the location, severity, and general description of data element errors in a message. This PDS may contain 1–10 occurrences of
message exception data. TAG N/A X M
Len Tag 3 positions, value = 014–140 LLLVAR
1 Data Element ID
Identifies the ISO data element or PDS where the error occurred. ISO data elements are identified with the prefix C. PDSs are identified with the prefix P followed by the fourdigit tag ID. an-5
2 Error Severity Code Indicates the severity of the error the clearing system detects. n-2
3 Error Message Code It is a four-digit value that refers to a specific edit error message to identify the error condition. an-4
4 Subfield ID Holds the three-position subfield ID of the element in error. This subfield will contain zeros if the element in error is not defined with subfields. n-3
0025 Message Reversal Indicator PDS 0025 (Message Reversal Indicator) identifies a message as a reversal of a previous message. TAG N/A X C
Len Tag 3 positions, value = 001–007 LLLVAR
1 Message Reversal Indicator “R”. If a member/processor does provide PDS 0025 in a clearing message, subfield 1 (Message Reversal Indicator) is always required and must contain an R or space. a-1
2
Central Site Processing Date of
Original Message
Subfield 2 (Central Site Processing Date of Original Message) is required only when PDS 0025 is present in First Presentment/1240 messages. Subfield 2 must contain a valid date
in the format YYMMDD. Subfield 2, if present, must contain a date that is less than or equal to the clearing system processing date. n-6
0138 Source Message Number ID PDS 0138 DE 71 (Message Number) of the message that caused the file to reject (if the clearing system can parse) TAG N/A X C
Len Tag “008” n-8; LLL
0165 Settlement Indicator PDS 0165 (Settlement Indicator) indicates the settlement impact of amounts in an IPM message. TAG N/A X C
Len Tag 3 positions, value = 001–030 ans...30
1 Settlement Indicator Identifies the type of clearing and settlement processing to be performed for a transaction. an-1
2 Settlement Information
The message originator may provide Settlement Information. This optional variable-length subfield (up to 29 characters long) may contain additional information related to a
bilateral settlement agreement. ans...29
0280 Source File ID PDS 0280 (Source File ID) provides the File ID of a referenced data file. Refer to PDS 0105 in the chapter “File Header and Trailer messages” for descriptions of these subfields. TAG N/A X C
Len Tag “025” n-25; LLL
71 Message Number The transaction originator assigns the DE 71 (Message Number) to data messages in a file. DE 71 monitors the integrity and continuity of the files being exchanged (2, 3, 4…) TAG N/A X M
93 Transaction Destination Institution
ID Code
DE 93 (Transaction Destination Institution ID Code) identifies the transaction destination institution n 6...11;
LLVAR
N/A X M
94 Transaction Originator Institution ID
Code
DE 94 (Transaction Originator Institution ID Code) identifies the transaction originator institution n 6...11;
LLVAR
N/A X M
100 Receiving Institution ID Code DE 100 (Receiving Institution ID Code) identifies the receiving institution n..11;
LLVAR
N/A X M
Banking Production Center
SmartVista Back Office
13
Data Element Definitions
DE22 POS Data code
Table 8. Structure of the POS Data code field
№ Field Description
1 Card data input capability Card data input capability
2 Cardholder authentication capability The ability to authenticate the cardholder
3 Card capture capability The ability to capture cards
4 Operating environment Operating environment (POS Condition Code )
5 Cardholder presence indicator The presence of the cardholder
6 Card presence The presence of the card
7 Card data input mode Card data input method
8 Cardholder authentication method The method of authentication of the card holder
9 Cardholder authentication of the entity Authentication of the cardholder
10 Card data output capability Card data output capability
11 Terminal output capability Terminal output capability
12 PIN capture capability PIN capture capability
Table 9. The possible values for the Card data input capability
Value Description
0 Unknown
1 Manual input, no terminal
2 Magnetic stripe reader capability
3 Barcode reading
4 OCR (optical character recognition of images )
5 Chip reader, magnetic stripe reader
6 Manual entry using the Terminal
7 Magnetic stripe reader and key entry capability
8 Magnetic stripe reader, chip reader and key entry capability
9 Contactless reader
Table 10. The possible values for Cardholder authentication capability
Value Description
0 The possibility of electronic authentication is not available
1 It is possible to authenticate using PIN
2 Electronic signature analysis capability
3 Biometric authentication
4 Biographic authentication
5 Electronic authentication
6 Another authentication method
Table 11. The possible values for Card capture capability
Value Description
Banking Production Center
SmartVista Back Office
14
0 There is no possibility of capture cards
1 There is an opportunity to capture cards
Table 12. The possible values for Operating environment
Value Description
0 No terminal used
1 On card acceptor premises; attended terminal
2 On card acceptor premises; unattended terminal
3 Off card acceptor premises; attended
4 Off card acceptor premises; unattended
5 On cardholder premises; unattended
9 On cardholder premises; attended
R CAT level 0, unattended
S CAT level 1, unattended
T CAT level 2, unattended
U CAT level 3, unattended
V CAT level 4, unattended
W CAT level 5, unattended
X CAT level 6, unattended
Y CAT level 7, unattended
Table 13. The possible values for Cardholder presence indicator
Value Description
0 The card holder is present
1 The card holder is not present, the causes are not specified
2 The card holder is not present, the mail-order
3 The card holder is not present, order by phone
4 The card holder is not present, the recurring payment
5 The card holder is not present, e-commerce
S The card holder is not present, the deferred payment
Table 14. The possible values for Card presence
Value Description
0 There is no card
1 The card is present
Table 15. The possible values for Card data input mode
Value Description
0 Unspecified; data unavailable
1 Manual input; no terminal
2 Magnetic stripe reader input
3 Barcode reading
4 Read through OCR (optical pattern recognition)
5 Reading the chip
6 Key entered input
Banking Production Center
SmartVista Back Office
15
7 Contactless input,
8 Non-contact chip reading with the use of magnetic stripe data
9 Contactless reader
S E-commerce Transaction at the point that supports the security protocol ICS (3-D Secure), but without using it
T E-commerce Transaction at the point that supports the security protocol ICS (3-D Secure) using this Protocol
U E-commerce transaction without the use of security features.
V E-commerce transaction using encrypted data channel
W Automatic input of data saved previously in a third-party system
X E-commerce transaction conducted with a trusted merchant
Table 16. The possible values for Cardholder authentication method
Value Description
0 Authentication was not performed
1 Authentication using PIN
2 Electronic signature analysis
5 Manual signature verification
6 Another authentication method
U E-commerce Authentication Protocol 3 DS is supported by, but is not supported by issuer
V E-commerce, a successful authentication by 3 DS
W E-commerce, authentication attempt on 3 DS
X E-commerce, merchant authentication
Table 17. The possible values for Cardholder authentication entity
Value Description
0 Not authenticated
1 Authentication using chip- offline PIN
2 Terminal
3 Issuer Authentication (authorization)- online PIN
4 Merchant/card acceptor—signature
5 Other authentication
S The suspicion raised by the merchant
Table 18. The possible values for Card data output capability
Value Description
0 Unknown
1 None
2 Magnetic stripe write
3 ICC
Table 19. The possible values for Terminal output capability
Value Description
0 Unknown; data unavailable
Banking Production Center
SmartVista Back Office
16
1 None
2 Printing capability only
3 Display capability only
4 Printing and display capability
Table 20. The possible values for PIN capture capability
Value Description
0 No PIN capture capability
1 Unknown
4 Is Processed PIN up to 4 digits
5 Is Processed PIN up to 5 digits
6 Is Processed PIN up to 6 digits
7 Is Processed PIN up to 7 digits
8 Is Processed PIN up to 8 digits
9 Is Processed PIN up to 9 digits
A Is Processed PIN up to 10 digits
B Is Processed PIN up to 11 digits
C Is Processed PIN up to 12 digits
PDS1002 Transaction types
Table 21. Common SV transaction types correspondence
SV Transaction
Type (PDS1002)
Cardholder Transaction
Type (DE003S1)
TRANSACTION DESCRIPTION
508 00 Utility Payment
530 00 Transfer to external account
585 28 Cash-In/Cash deposit (on account)
618 28 Cash-In/Cash deposit
698 28 Credit Payment
700 01 Cash withdrawal
703 00 Funds Transfer
737 00 Purchase Completion
774 00 Purchase
775 20 Return or Refund
776 00 Purchase with Cash Back
781 18 P2P Debit
785 28 P2P Credit
Table 22. Transaction types for incoming presentments from MC network
SV Transaction
Type (PDS1002)
Cardholder Transaction
Type (DE003S1)
TRANSACTION DESCRIPTION
101 / 141 00, 09 Retail / reversal
104 / 144 01 ATM withdrawal / reversal
Banking Production Center
SmartVista Back Office
17
103 / 143 12 Cash advance / reversal
105 / 145 18 Unique (qvasicash) / reversal
109 / 149 20 Refund / reversal
108 / 148 28 Payment transaction / reversal
DE55 Integrated Circuit Card (ICC) SystemRelated Data
DE 55 data is presented in binary format and contains the data used locally by a card’s chip at a
chip-capable terminal. In a First Presentment/1240, the acquirer should not modify this data but instead pass it unaltered to the issuer.
Chip data in DE 55 consists of a series of components in a “tag-length-data” format, similar to the
presentation of PDSs in DE 48 (Additional Data). The following table shows the layout.
Table 23. DE55 layout
Number Positions Description
1 1 or 1–2 First chip subelement tag (ID)
2 2 or 3 First chip subelement data length
3 3-xxx or 4–xxx First chip subelement data (variable length)
Components 1–3 must be repeated as needed until all chip subelements are presented. The length of
the “tag” component is either 1 or 2, depending on the definition of the tag in EMV chip. The length
of the “data length” component is always one in DE 55.
Mandatory and Conditional Subelements
When customers send DE 55 in clearing messages related to a chip transaction, the following data
elements must be present.
Table 24. Mandatory subelements
Subelement Description Tag
Value
Format Component Each
Component
Length
Total
Subelement
Length
Application Cryptogram (AC) 9F26 b8 tag 2 11
length 1
data 8
Cryptogram Information Data 9F27 b1 tag 2 4
length 1
data 1
Cryptogram Information Data 9F27 b1 tag 2 4
length 1
data 1
Issuer Application Data (IAD) (Must be
provided by the acquirer if the corresponding data object is provided by the
ICC to the terminal)
9F10 b1..32,
VAR
tag 2 4-35
length 1
data 1-32
Banking Production Center
SmartVista Back Office
18
Unpredictable Number 9F37 b4 tag 2 7
length 1
data 4
Application Transaction Counter 9F36 b2 tag 2 5
length 1
data 2
Terminal Verification Result 95 b5 tag 1 7
length 1
data 5
Transaction Date 9A b3 (n6) tag 1 5
length 1
data 3
Transaction Type 9C b1 (n2) tag 1 3
length 1
data 1
Amount Authorized (numeric) 9F02 b6 (n12) tag 2 9
length 1
data 6
Transaction Currency Code 5F2A b2 (n3) tag 2 5
length 1
data 2
Application Interchange Profile 82 b2 tag 1 4
length 1
data 2
Terminal Country Code 9F1A b2 (n3) tag 2 5
length 1
data 2
Amount, Other (numeric) 9F03 b6 (n12) tag 2 9
length 1
data 6
Optional Subelements
Customers may send the following subelements:
Table 25. Optional subelements
Subelement Description Tag
Value
Format Component Each
Component
Length
Total
Subelement
Length
Cardholder Verification Method
(CVM) Results
9F34 b3 tag 2 6
length 1
data 3
Terminal Capabilities 9F33 b3 tag 2 6
length 1
data 3
Terminal Type 9F35 b1 tag 2 4
length 1
Banking Production Center
SmartVista Back Office
19
data 1
Interface Device Serial Number 9F1E b8 (an8) tag 2 11
length 1
data 8
Transaction Category Code 9F53 b1 (an1) tag 2 4
length 1
data 1
Dedicated File Name 84 b5..16 tag 1
length 1
data 5-16
Terminal Application version Number 9F09 b2 tag 2 5
length 1
data 2
Transaction Sequence Counter 9F41 b2 (n..8) tag 2 5-7
length 1
data 2-4
DE38 Approval Code
Field DE38 must contain an issuer’s authorization response code for all online-authorized transactions. This field is conditional as this requirement does not apply to transactions where online authorization is not requested or required, such as offline-authorized chip-read transactions, credit
(purchase return) transactions.
If DE 38 is present in a First Presentment message, it should be provided on all subsequent cycles
(First Chargeback, Second Presentment, and so on).
Banking Production Center
SmartVista Back Office
20
Data integrity check principles
During clearing file processing the file is checked against the following rules:
1. Correspondence between the field Bit Map and the number of filled fields in the message.
2. Field 71 Message Number is not filled sequentially
3. File structure is corrupted (missing header, trailer or data records)
4. Not unique File ID (field PDS 0105) in header and trailer messages
5. Check value “File Message Counts” in field PDS 0306 in trailer message is not equal to
the number of records in the file.
6. Check value “File Amount, Checksum” in field PDS 0301 in trailer message is not equal
to the total sum of transaction amounts of all records in the file.
7. Primary Account Number (PAN) field is missing in MTI 1240 messages.
Banking Production Center
SmartVista Back Office
21
Revision history
№ Date Author Description
1 01.09.2014 Andrey Tumanov Document has been created
2 02.12.2014 Andrey Tumanov PDS1002 added
3 12.12.2014 Andrey Tumanov DE43 field length changed
4 04.02.2015 Andrey Tumanov Fields description updated, DE55 tags description added
5 13.04.2015 Andrey Tumanov PDS0023 value list expanded
6 07.05.2015 Dmitry Sorvachev PDS0165 added
7 29.05.2015 Andrey Tumanov Some fields requirement changed
8 30.10.2015 Vladimir Mikhailov Added File Reject, Message Exception descriptions
9 12.09.2017 Vladimir Mikhailov DE043S1/S2/S3 both types of delimiters are used
10 15.09.2017 Vladimir Mikhailov Table “Transaction types for incoming presentments from MC
network” added with PDS1002 values
11 29.03.2018 Igor Gogolev Actualization of the terminal type (PDS0023): values and field
size
12 06.10.2023 Dmitry Knyazev DE038 description added