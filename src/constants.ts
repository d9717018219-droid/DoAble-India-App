
export const CITIES_LIST = [
  'Ahmedabad', 'Allahabad', 'Amravati', 'Amritsar', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 'Cochin', 'Coimbatore', 'Dehradun', 'Delhi', 'Dispur', 'Faridabad', 'Gandhinagar', 'Ghaziabad', 'Greater Noida', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Itanagar', 'Jaipur', 'Kanpur', 'Kolkata', 'Kota', 'Leh', 'Lucknow', 'Mangalore', 'Meerut', 'Mohali', 'Mumbai', 'Nagpur', 'Noida', 'Panaji', 'Panchkula', 'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Ranchi', 'Shimla', 'Srinagar', 'Surat', 'Thane', 'Trivandrum', 'Vadodara', 'Varanasi', 'Vellore', 'Zirakpur'
].sort();

export const CLASSES_LIST = [
  '1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std',
  '6th Std', '7th Std', '8th Std', '9th Std', '10th Std',
  '11th Std', '12th Std'
];

export const CLASS_SUBJECTS_DATA: Record<string, string[]> = {
    '1st Std': ['All Subjects (General)', 'English', 'Hindi', 'Maths', 'EVS', 'Computer', 'Art & Craft'],
    '2nd Std': ['All Subjects (General)', 'English', 'Hindi', 'Maths', 'EVS', 'Computer', 'Art & Craft'],
    '3rd Std': ['All Subjects (General)', 'English', 'Hindi', 'Maths', 'EVS', 'Computer', 'Art & Craft'],
    '4th Std': ['All Subjects (General)', 'English', 'Hindi', 'Maths', 'EVS', 'Computer', 'Art & Craft'],
    '5th Std': ['All Subjects (General)', 'English', 'Hindi', 'Maths', 'EVS', 'Computer', 'Art & Craft'],
    '6th Std': ['Maths', 'Science', 'English', 'Hindi', 'Social Science (SST)', 'Sanskrit', 'Computer'],
    '7th Std': ['Maths', 'Science', 'English', 'Hindi', 'Social Science (SST)', 'Sanskrit', 'Computer'],
    '8th Std': ['Maths', 'Science', 'English', 'Hindi', 'Social Science (SST)', 'Sanskrit', 'Computer'],
    '9th Std': ['Maths', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Economics', 'English', 'Hindi', 'Computer'],
    '10th Std': ['Maths', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Economics', 'English', 'Hindi', 'Computer'],
    '11th Std': ['Physics', 'Chemistry', 'Maths', 'Biology', 'Accounts', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English Core', 'IP', 'Physical Education'],
    '12th Std': ['Physics', 'Chemistry', 'Maths', 'Biology', 'Accounts', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'English Core', 'IP', 'Physical Education']
};

export const STATE_DISTRICT_LOCATIONS_DATA: Record<string, Record<string, string[]>> = {
  'Telangana': {
    'Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kondapur', 'Madhapur', 'Hitech City', 'Kukatpally', 'Ameerpet', 'Secunderabad', 'Uppal', 'Dilsukhnagar', 'LB Nagar', 'Miyapur', 'Manikonda', 'Attapur', 'Begumpet', 'Somajiguda', 'Nampally', 'Abids', 'Toli Chowki', 'Mehdipatnam', 'Sainikpuri', 'AS Rao Nagar', 'Alwal', 'Balanagar', 'Bowenpally', 'Lingampally', 'Chandanagar', 'Nizampet', 'Boduppal', 'Nacharam', 'Mallapur', 'Tarnaka', 'Habsiguda', 'Amberpet', 'Barkatpura', 'Himayatnagar', 'Kachiguda', 'Koteshwar', 'Moosapet'],
  },
  'Karnataka': {
    'Bangalore': ['Indiranagar', 'Koramangala', 'Jayanagar', 'JP Nagar', 'HSR Layout', 'Whitefield', 'Electronic City', 'Marathahalli', 'BTM Layout', 'Banashankari', 'Malleshwaram', 'Rajajinagar', 'Hebbal', 'Yelahanka', 'RT Nagar', 'Kammanahalli', 'Kalyan Nagar', 'Basavanagudi', 'Bannerghatta Road', 'Sarjapur Road', 'Bellandur', 'Varthur', 'Kanakapura Road', 'Kengeri', 'Vijayanagar', 'Basaveshwara Nagar', 'Sanjay Nagar', 'Sadashiva Nagar', 'Frazer Town', 'Cooke Town', 'Benson Town', 'Richmond Town', 'Lavelle Road', 'MG Road', 'Ulsoor', 'Victoria Layout', 'Wilson Garden', 'Ejipura', 'Domlur', 'New Thippasandra', 'Hennur', 'Horamavu', 'Ramamurthy Nagar', 'KR Puram', 'Mahadevapura', 'Hoodi', 'Brookefield'],
    'Mangalore': ['Bejai', 'Kasturba', 'Kadri', 'Lighthouse Hill', 'Falnir', 'Hampankatta', 'Kulshekar', 'Surathkal', 'Ullal', 'Konchady', 'Derebail'],
  },
  'Tamil Nadu': {
    'Chennai': ['Adyar', 'Anna Nagar', 'Besant Nagar', 'Mylapore', 'Nungambakkam', 'T Nagar', 'Velachery', 'Ambattur', 'Chromepet', 'Egmore', 'Guindy', 'Kilpauk', 'Kodambakkam', 'Madipakkam', 'Mogappair', 'Pallavaram', 'Perambur', 'Saidapet', 'Tambaram', 'Thiruvanmiyur', 'Vadapalani', 'Valasaravakkam', 'West Mambalam', 'Sholinganallur', 'Perungudi', 'Taramani', 'Karapakkam', 'Old Mahabalipuram Road (OMR)', 'East Coast Eoad (ECR)', 'Royapettah', 'Triplicane', 'Santhome'],
    'Coimbatore': ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Singanallur', 'Saravanampatti', 'Ramanathapuram', 'Saibaba Colony', 'Vadavalli', 'Thudiyalur', 'Race Course', 'Town Hall'],
    'Vellore': ['Katpadi', 'Gandhinagar', 'Sathuvachari', 'Vellore Fort Area', 'Bagayam', 'Thorapadi', 'Otteri'],
  },
  'Assam': {
    'Dispur': ['Sarumataria', 'Last Gate', 'Super Market Area', 'Ganeshguri', 'Beltola', 'Hatigaon', 'Zoo Road'],
    'Guwahati': ['GS Road', 'Zoo Road', 'Ganeshguri', 'Beltola', 'Hatigaon', 'Six Mile', 'Khanapara', 'Chandmari', 'Silpukhuri', 'Uzan Bazar', 'Pan Bazar', 'Paltan Bazar', 'Rehabari', 'Ulubari', 'Bhangagarh', 'Christian Basti', 'Noonmati', 'Narengi', 'Maligaon', 'Jalukbari', 'Adabari', 'Kamakhya', 'Kahilipara', 'Lal Ganesh', 'Basistha'],
  },
  'Arunachal Pradesh': {
    'Itanagar': ['Ganga Market', 'Naharlagun', 'RK Mission Area', 'Chandranagar', 'P-Sector', 'Zero Point', 'Itanagar City'],
  },
  'Chandigarh (UT)': {
    'Chandigarh': ['Sector 1', 'Sector 2', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 15', 'Sector 17', 'Sector 22', 'Sector 34', 'Sector 35', 'Sector 44', 'Sector 46', 'Mani Majra', 'Sarangpur', 'Kishangarh'],
  },
  'Goa': {
    'Panaji': ['Miramar', 'Dona Paula', 'Santa Inez', 'Caranzalem', 'Altinho', 'Fontainhas', 'Campal', 'Patto'],
  },
  'Uttar Pradesh': {
    'Lucknow': ['Aliganj', 'Aminabad', 'Gomti Nagar', 'Hazratganj', 'Indira Nagar', 'Janki Puram', 'Mahanagar', 'Rajaji Puram', 'Vikas Nagar', 'Chowk', 'LDA Colony', 'Ashiyana', 'Chinhat', 'Jia Mau', 'Arjunganj'],
    'Noida': ['Sector 15', 'Sector 18', 'Sector 27', 'Sector 37', 'Sector 44', 'Sector 50', 'Sector 62', 'Sector 74', 'Sector 78', 'Sector 93', 'Sector 110', 'Sector 128', 'Sector 137', 'Sector 150', 'Noida Extension', 'Dadri Road', 'Greater Noida West'],
    'Greater Noida': ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1', 'Gamma 2', 'Delta 1', 'Delta 2', 'Omega', 'Zeta', 'Knowledge Park', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Greater Noida West', 'Pari Chowk', 'Chi-Phi', 'Eco Village 1', 'Eco Village 2', 'Eco Village 3'],
    'Ghaziabad': ['Indirapuram', 'Vaishali', 'Vasundhara', 'Kaushambi', 'Raj Nagar Extension', 'Crossings Republik', 'Kavi Nagar', 'Raj Nagar', 'Shastri Nagar', 'Govindpuram', 'Sanjay Nagar', 'Pratap Vihar', 'Vijay Nagar', 'Lal Kuan', 'Ghaziabad City', 'Sahibabad', 'Loni', 'Surya Nagar', 'Siddharth Vihar', 'Wave City', 'Ashok Nagar'],
    'Meerut': ['Shastri Nagar', 'Modipuram', 'Pallavpuram', 'Kanker Khera', 'Civil Lines', 'Saket', 'Begum Bridge', 'Abu Lane', 'Meerut Cantt'],
    'Kanpur': ['Kalyanpur', 'Kidwai Nagar', 'Civil Lines', 'Swaroop Nagar', 'Azad Nagar', 'Lajpat Nagar', 'Sharda Nagar', 'Indira Nagar', 'Kakadeo', 'Gumti No. 5'],
    'Allahabad': ['Civil Lines', 'Katra', 'Ashok Nagar', 'George Town', 'Tagore Town', 'Kydganj', 'Jhalwa', 'Naini', 'Jhusi', 'Phaphamau'],
    'Varanasi': ['Lanka', 'Sigra', 'Sarnath', 'Cantonment', 'Mahmoorganj', 'Bhelupur', 'Luxa', 'Nadesar', 'Godowlia', 'Paharia', 'Shivpur', 'DLW Area', 'Bhojubir'],
  },
  'Delhi (NCT)': {
    'Delhi': ['Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Vikaspuri', 'Uttam Nagar', 'Paschim Vihar', 'Shalimar Bagh', 'Ashok Vihar', 'Model Town', 'Mukherjee Nagar', 'Civil Lines', 'Kamla Nagar', 'Connaught Place', 'Karol Bagh', 'P Patel Nagar', 'Rajouri Garden', 'Greater Kailash', 'Lajpat Nagar', 'South Extension', 'Hauz Khas', 'Saket', 'Malviya Nagar', 'Vasant Kunj', 'Vasant Vihar', 'Defence Colony', 'Green Park', 'Nehru Place', 'Kalkaji', 'Sarita Vihar', 'Jasola', 'Mayur Vihar', 'Laxmi Nagar', 'Preet Vihar', 'Shahdara', 'Yamuna Vihar', 'Karawal Nagar', 'Anand Niketan', 'Anand Parbat', 'Chattarpur', 'Defense Colony', 'Dwarka Mor', 'IP Extension', 'Jangpura', 'Jor Bagh', 'Karampura', 'Narela', 'Panchsheel Park', 'Paschim Puri', 'Sainik Farms', 'Shahpur Jat'],
  },
  'Haryana': {
    'Faridabad': ['Sector 15', 'Sector 16', 'Sector 14', 'Sector 21', 'NIT', 'Old Faridabad', 'Ballabhgarh', 'Greater Faridabad', 'Sector 37', 'Sector 82'],
    'Gurgaon': ['DLF City Phase 1', 'DLF City Phase 2', 'DLF City Phase 3', 'DLF City Phase 4', 'DLF City Phase 5', 'Sushant Lok 1', 'Sushant Lok 2', 'Sushant Lok 3', 'Palam Vihar', 'MG Road', 'Sohna Road', 'Golf Course Road', 'Golf Course Extension Road', 'New Gurgaon', 'Old Gurgaon', 'IMT Manesar', 'Maruti Kunj', 'Sector 14', 'Sector 15', 'Sector 31', 'Sector 45', 'Sector 56', 'Sector 82'],
    'Panchkula': ['Sector 2', 'Sector 4', 'Sector 6', 'Sector 7', 'Sector 8', 'Sector 9', 'Sector 11', 'Sector 12', 'Sector 15', 'Sector 20', 'MDC Sector 4', 'MDC Sector 5', 'Pinjore'],
  },
  'Punjab': {
    'Amritsar': ['Ranjit Avenue', 'Lawrence Road', 'Golden Temple Area', 'Putlighar', 'Civil Lines', 'Mall Road', 'Majitha Road'],
    'Mohali': ['Phase 1-11', 'Sector 67', 'Sector 68', 'Sector 70', 'Sector 71', 'Sector 79', 'Sector 80', 'Aerocity', 'Eco City'],
    'Zirakpur': ['VIP Road', 'Lohgarh', 'Dhakoli', 'Gazipur', 'Peer Muchalla', 'Nagla Road', 'High Ground', 'Utrathiya'],
  },
  'Rajasthan': {
    'Jaipur': ['Vaishali Nagar', 'Malviya Nagar', 'Mansarovar', 'C-Scheme', 'Civil Lines', 'Bani Park', 'Raja Park', 'Jagatpura', 'Shyam Nagar', 'Tonk Road', 'Adarsh Nagar', 'Tilak Nagar', 'Ajmer Road', 'Sirsi Road', 'Jhotwara', 'Vidhyadhar Nagar'],
    'Kota': ['Talwandi', 'Mahaveer Nagar', 'Jawahar Nagar', 'Vigyan Nagar', 'Dadabari', 'Indira Vihar', 'Kunhadi', 'Rangbari'],
  },
  'West Bengal': {
    'Kolkata': ['Park Street', 'Shakespeare Sarani', 'Camac Street', 'Alipore', 'New Alipore', 'Ballygunge', 'Gariahat', 'Salt Lake', 'New Town', 'Rajarhat', 'Behala', 'Tollygunge', 'Jadavpur', 'Garia', 'Kasba', 'Lake Town', 'Dum Dum', 'Ultadanga', 'Shobhabazar', 'Barabazar', 'Howrah'],
  },
  'Bihar': {
    'Patna': ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra Colony', 'Rajendra Nagar', 'SK Puri', 'Anisabad', 'Danapur', 'Fraser Road', 'Exhibition Road', 'Ashok Rajpath'],
  },
  'Madhya Pradesh': {
    'Bhopal': ['Arera Colony', 'Gulmohar', 'Indrapuri', 'Saket Nagar', 'Kolar Road', 'MP Nagar', 'Habibganj', 'Ayodhya Bypass', 'Bairagarh', 'TT Nagar'],
  },
  'Maharashtra': {
    'Mumbai': ['Colaba', 'Cuffe Parade', 'Nariman Point', 'Marine Drive', 'Malabar Hill', 'Worli', 'Prabhadevi', 'Dadar', 'Matunga', 'Sion', 'Bandra West', 'Bandra East', 'Khar', 'Santacruz', 'Vile Parle', 'Juhu', 'Andheri West', 'Andheri East', 'Powai', 'Goregaon', 'Malad', 'Kandivali', 'Borivali', 'Dahisar', 'Kurla', 'Ghatkopar', 'Vikhroli', 'Mulund', 'Chembur'],
    'Pune': ['Kothrud', 'Baner', 'Aundh', 'Wakad', 'Hinjewadi', 'Viman Nagar', 'Kalyani Nagar', 'Hadapsar', 'Magarpatta City', 'Koregaon Park', 'Camp', 'Shivajinagar', 'Pimple Saudagar', 'Visharant Wadi', 'Kondhwa', 'Katraj', 'Bibwewadi'],
    'Nagpur': ['Dharampeth', 'Ramdaspeth', 'Laxmi Nagar', 'Civil Lines', 'Sitabuldi', 'Manish Nagar', 'Narendra Nagar', 'Bajaj Nagar'],
    'Thane': ['Ghodbunder Road', 'Majiwada', 'Vasant Vihar', 'Hiranandani Estate', 'Naupada', 'Panchpakhadi', 'Pokhran Road', 'Kalwa', 'Kalyan', 'Dombivli'],
    'Amravati': ['Rajapeth', 'Badnera Road', 'Camp Area', 'Gadge Nagar', 'Sai Nagar', 'Rukmini Nagar', 'Vidyut Nagar'],
  },
  'Chhattisgarh': {
    'Raipur': ['Shankar Nagar', 'Pandri', 'Telibandha', 'Mowa', 'Devendra Nagar', 'Samta Colony', 'Kota', 'Tatibandh', 'Raipura'],
  },
  'Jharkhand': {
    'Ranchi': ['Morabadi', 'Lalpur', 'Harmu', 'Doranda', 'Ashok Nagar', 'Bariatu', 'Kanke Road', 'Upper Bazar', 'Namkum'],
  },
  'Odisha': {
    'Bhubaneswar': ['Patia', 'Chandrasekharpur', 'Nayapalli', 'Jayadev Vihar', 'Saheed Nagar', 'Khandagiri', 'Unit 1-9', 'Old Town', 'IRC Village'],
  },
  'Uttarakhand': {
    'Dehradun': ['Rajpur Road', 'Jakhan', 'Ballupur', 'Patel Nagar', 'Dalanwala', 'Vasant Vihar', 'Sahastradhara Road', 'Chakrata Road', 'Prem Nagar'],
  },
  'Himachal Pradesh': {
    'Shimla': ['Mall Road', 'Chotta Shimla', 'Kasumpti', 'Sanjauli', 'Lakkar Bazar', 'Summer Hill'],
  },
  'Jammu & Kashmir (UT)': {
    'Srinagar': ['Lal Chowk', 'Rajbagh', 'Jawahar Nagar', 'Bemina', 'Hazratbal', 'Soura', 'Karan Nagar'],
  },
  'Gujarat': {
    'Ahmedabad': ['Satellite', 'Vastrapur', 'Bopal', 'Prahlad Nagar', 'Thaltej', 'Bodakdev', 'Navarangpura', 'CG Road', 'Ambawadi', 'Ellisbridge', 'Naranpura', 'Ghatlodiya', 'Chandkheda', 'Maninagar'],
    'Gandhinagar': ['Sector 1-30', 'Kudasan', 'Sargasan', 'Raysan', 'Infocity', 'Gift City Area'],
    'Surat': ['Adajan', 'Vesu', 'City Light', 'Althan', 'Varachha', 'Piplod', 'Katargam', 'Nanpura'],
    'Vadodara': ['Akota', 'Alkapuri', 'Gotri', 'Manjalpur', 'Sayajiganj', 'Fatehgunj', 'Vasna Road', 'Channi'],
  },
  'Union Territories': {
    'Leh': ['Main Market', 'Choglamsar', 'Spituk', 'Shey', 'Thiksey', 'Saboo'],
    'Pondicherry': ['White Town', 'Heritage Town', 'Muthialpet', 'Lawspet', 'Reddiarpalayam', 'Saravanan Nagar'],
  },
  'Kerala': {
    'Cochin': ['Edappally', 'Kadavanthra', 'Marine Drive', 'Panampilly Nagar', 'Vytilla', 'Kakkanad', 'Palarivattom', 'Fort Kochi'],
    'Trivandrum': ['Kazhakkoottam', 'Kowdiar', 'Pattom', 'Peroorkada', 'Sasthamangalam', 'Vattiyoorkavu', 'Thampanoor', 'East Fort'],
  },
};

export const TIME_PERIODS_DATA: Record<string, string[]> = {
    'Morning': [
        '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM',
        '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'
    ],
    'Afternoon': [
        '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
        '02:30 PM', '03:00 PM', '03:30 PM'
    ],
    'Evening': [
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
        '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
    ]
};

export const DAY_GROUPS_DATA = {
    'Weekdays': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    'Weekend': ['Saturday', 'Sunday']
};
