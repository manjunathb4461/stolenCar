package db

type Cop struct {
	Id string					`bson:"_id"`
	Available int				`bson:"available"`
    CarId string				`bson:"carId"`
}

type Car struct {
	Id string					`bson:"_id"`
	Color string				`bson:"color,omitempty"`
    ModelName string			`bson:"modelName,omitempty"`
    OwnerName string			`bson:"ownerName,omitempty"`
    PhoneNumber int				`bson:"phoneNumber,omitempty"`
    Resolved int				`bson:"resolved"`
    Assigned int				`bson:"assigned"`
    CopId string				`bson:"copId"`
	// Title  string				`bson:"title,omitempty"`
	// Author string				`bson:"author,omitempty"`
	// Tags   []string				`bson:"tags,omitempty"`
}

type User struct {
	Uname string			`bson:"_id"`
	Passwd string			`bson:"available"`
	Role string				`bson:"role"`
}
